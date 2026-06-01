'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { QuickPressCharToken } from '@/lib/quick-press-plain-text';
import {
  parseMarkdownToQuickPressTokens,
  parseQuickPressStreamLine,
} from '@/lib/quick-press-plain-text';
import {
  QUICK_PRESS_BODY_CHAR_MS,
  QUICK_PRESS_BODY_PAUSE_MS,
  QUICK_PRESS_LABEL,
  QUICK_PRESS_LABEL_CHAR_MS,
  sleep,
} from '@/lib/quick-press-stream-config';

export type QuickPressStreamMode = 'api' | 'local';

type UseQuickPressStreamOptions = {
  enabled: boolean;
  mode: QuickPressStreamMode;
  quizId: string;
  questionId: string;
  /** mode=local のときのみ（テストプレイ等） */
  localBodyMarkdown?: string;
  getIdToken?: () => Promise<string | null>;
  onBodyTimingStart?: () => void;
};

function labelTokensForLength(length: number): QuickPressCharToken[] {
  return Array.from(QUICK_PRESS_LABEL.slice(0, length)).map((char) => ({
    char,
    bold: false,
  }));
}

function errorTokens(message: string): QuickPressCharToken[] {
  return Array.from(message).map((char) => ({ char, bold: false }));
}

export function useQuickPressStream({
  enabled,
  mode,
  quizId,
  questionId,
  localBodyMarkdown = '',
  getIdToken,
  onBodyTimingStart,
}: UseQuickPressStreamOptions) {
  const [displayTokens, setDisplayTokens] = useState<QuickPressCharToken[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const runIdRef = useRef(0);
  const getIdTokenRef = useRef(getIdToken);
  const onBodyTimingStartRef = useRef(onBodyTimingStart);
  const localBodyRef = useRef(localBodyMarkdown);

  getIdTokenRef.current = getIdToken;
  onBodyTimingStartRef.current = onBodyTimingStart;
  localBodyRef.current = localBodyMarkdown;

  const abortActiveIO = useCallback(() => {
    abortRef.current?.abort();
    void readerRef.current?.cancel();
    readerRef.current = null;
    abortRef.current = null;
  }, []);

  /** 進行中の run() を無効化し、ネットワーク受信も止める */
  const cancelStream = useCallback(() => {
    runIdRef.current += 1;
    abortActiveIO();
    setIsStreaming(false);
  }, [abortActiveIO]);

  useEffect(() => {
    if (!enabled) {
      abortActiveIO();
      setIsStreaming(false);
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;

    const isStale = () => cancelled || runId !== runIdRef.current;

    async function streamBodyFromApi() {
      const token = getIdTokenRef.current
        ? await getIdTokenRef.current()
        : null;
      const params = new URLSearchParams({ quizId, questionId });
      const abort = new AbortController();
      abortRef.current = abort;

      const response = await fetch(`/api/quiz/quick-press-stream?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: abort.signal,
        cache: 'no-store',
      });

      if (!response.ok || !response.body) {
        throw new Error('問題文のストリーム取得に失敗しました');
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      readerRef.current = reader;

      let lineBuffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done || isStale()) break;
        if (!value) continue;

        lineBuffer += value;
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';

        const chunk: QuickPressCharToken[] = [];
        for (const line of lines) {
          const bodyToken = parseQuickPressStreamLine(line);
          if (bodyToken) chunk.push(bodyToken);
        }
        if (chunk.length > 0 && !isStale()) {
          setDisplayTokens((prev) => [...prev, ...chunk]);
        }
      }
    }

    async function streamBodyLocally(fullBody: string) {
      const bodyTokens = parseMarkdownToQuickPressTokens(fullBody);
      for (const bodyToken of bodyTokens) {
        if (isStale()) return;
        await sleep(QUICK_PRESS_BODY_CHAR_MS);
        if (isStale()) return;
        setDisplayTokens((prev) => [...prev, bodyToken]);
      }
    }

    async function run() {
      setStreamError(null);
      setDisplayTokens([]);
      setIsStreaming(true);
      abortActiveIO();

      try {
        for (let i = 1; i <= QUICK_PRESS_LABEL.length; i++) {
          if (isStale()) return;
          await sleep(QUICK_PRESS_LABEL_CHAR_MS);
          if (isStale()) return;
          setDisplayTokens(labelTokensForLength(i));
        }

        if (isStale()) return;
        await sleep(QUICK_PRESS_BODY_PAUSE_MS);
        if (isStale()) return;

        onBodyTimingStartRef.current?.();

        if (mode === 'local') {
          await streamBodyLocally(localBodyRef.current);
        } else {
          await streamBodyFromApi();
        }
      } catch (err) {
        if (isStale()) return;
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('[useQuickPressStream]', err);
        const message = '問題：問題の読み込みに失敗しました。';
        setStreamError(message);
        setDisplayTokens(errorTokens(message));
      } finally {
        if (!isStale()) {
          setIsStreaming(false);
          readerRef.current = null;
          abortRef.current = null;
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
      runIdRef.current += 1;
      abortActiveIO();
      setIsStreaming(false);
    };
  }, [enabled, mode, quizId, questionId, abortActiveIO]);

  return {
    displayTokens,
    isStreaming,
    streamError,
    cancelStream,
  };
}
