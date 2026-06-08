/**
 * 早押し問題文: マークダウンを表示用1文字トークン列に変換（ストリーム配信用）。
 * parseMarkdownToHtml / markdownToPlainText と同じ露出ルールに合わせる。
 */

import { QUICK_PRESS_LABEL } from '@/lib/quick-press-stream-config';

export type QuickPressCharToken = {
  char: string;
  bold: boolean;
};

export type QuickPressStreamLayoutMessage = {
  kind: 'layout';
  tokens: QuickPressCharToken[];
};

export function quickPressLabelTokens(): QuickPressCharToken[] {
  return Array.from(QUICK_PRESS_LABEL).map((char) => ({
    char,
    bold: false,
  }));
}

export function buildQuickPressReservedTokens(
  bodyTokens: QuickPressCharToken[]
): QuickPressCharToken[] {
  return [...quickPressLabelTokens(), ...bodyTokens];
}

function pushChars(
  tokens: QuickPressCharToken[],
  text: string,
  bold: boolean
): void {
  for (const char of Array.from(text)) {
    tokens.push({ char: char === '\n' ? ' ' : char, bold });
  }
}

/**
 * 問題文マークダウンを、強調フラグ付きの1文字トークン列にパースする。
 */
export function parseMarkdownToQuickPressTokens(
  markdown: string
): QuickPressCharToken[] {
  const tokens: QuickPressCharToken[] = [];
  let rest = markdown;

  while (rest.length > 0) {
    if (rest.startsWith('**')) {
      const match = rest.match(/^\*\*([\s\S]+?)\*\*/);
      if (match) {
        pushChars(tokens, match[1], true);
        rest = rest.slice(match[0].length);
        continue;
      }
    }

    if (rest.startsWith('*') && !rest.startsWith('**')) {
      const match = rest.match(/^\*([^*]+?)\*/);
      if (match) {
        pushChars(tokens, match[1], false);
        rest = rest.slice(match[0].length);
        continue;
      }
    }

    if (rest.startsWith('[')) {
      const match = rest.match(/^\[([^\]]*)\]\([^)]*\)/);
      if (match) {
        pushChars(tokens, match[1], false);
        rest = rest.slice(match[0].length);
        continue;
      }
    }

    if (rest[0] === '\n') {
      tokens.push({ char: ' ', bold: false });
      rest = rest.slice(1);
      continue;
    }

    pushChars(tokens, rest[0], false);
    rest = rest.slice(1);
  }

  return tokens;
}

/** NDJSON 1行（サーバー送信・クライアント受信） */
export function serializeQuickPressStreamToken(token: QuickPressCharToken): string {
  return `${JSON.stringify(token)}\n`;
}

function isQuickPressCharToken(value: unknown): value is QuickPressCharToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as QuickPressCharToken).char === 'string' &&
    typeof (value as QuickPressCharToken).bold === 'boolean' &&
    (value as QuickPressCharToken).char.length > 0
  );
}

export function parseQuickPressStreamLayoutLine(
  line: string
): QuickPressStreamLayoutMessage | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as QuickPressStreamLayoutMessage;
    if (
      parsed?.kind !== 'layout' ||
      !Array.isArray(parsed.tokens) ||
      !parsed.tokens.every(isQuickPressCharToken)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function serializeQuickPressStreamLayout(
  tokens: QuickPressCharToken[]
): string {
  return `${JSON.stringify({ kind: 'layout', tokens } satisfies QuickPressStreamLayoutMessage)}\n`;
}

export function parseQuickPressStreamLine(line: string): QuickPressCharToken | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as QuickPressCharToken;
    if (!isQuickPressCharToken(parsed)) {
      return null;
    }
    return { char: parsed.char, bold: parsed.bold };
  } catch {
    return null;
  }
}
