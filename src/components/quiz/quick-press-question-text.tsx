'use client';

import type { CSSProperties } from 'react';
import type { QuickPressCharToken } from '@/lib/quick-press-plain-text';
import { QUICK_PRESS_WIPE_CHAR_MS } from '@/lib/quick-press-stream-config';
import styles from './quick-press-question-text.module.css';

type QuickPressQuestionTextProps = {
  tokens: QuickPressCharToken[];
  /** 全文分の非表示レイアウト用トークン（問読み中のボタン位置ずれ防止） */
  reservedTokens?: QuickPressCharToken[];
  className?: string;
};

const NORMAL_GRADIENT =
  'linear-gradient(to right, var(--text-main) 50%, rgba(243, 240, 252, 0) 50%)';
const BOLD_GRADIENT =
  'linear-gradient(to right, var(--color-accent) 50%, rgba(0, 245, 212, 0) 50%)';

function renderChar(token: QuickPressCharToken, key: string, animated: boolean) {
  return (
    <span
      key={key}
      className={`${styles.char} ${token.bold ? styles.charBold : ''} ${animated ? styles.charAnimated : styles.charReserved}`}
      style={
        animated
          ? {
              backgroundImage: token.bold ? BOLD_GRADIENT : NORMAL_GRADIENT,
              backgroundSize: '200% 100%',
            }
          : undefined
      }
    >
      {token.char === ' ' ? '\u00A0' : token.char}
    </span>
  );
}

/**
 * 早押し問題文: ストリームで届いたトークンを1文字ずつ左ワイプで表示する。
 * reservedTokens があるときは非表示レイヤーで全文分の高さを先に確保する。
 */
export function QuickPressQuestionText({
  tokens,
  reservedTokens = [],
  className,
}: QuickPressQuestionTextProps) {
  const hasReservedLayout = reservedTokens.length > 0;

  return (
    <h2
      className={`${className ?? ''} ${styles.root} ${hasReservedLayout ? styles.rootReserved : ''}`}
      style={
        {
          '--quick-press-wipe-ms': `${QUICK_PRESS_WIPE_CHAR_MS}ms`,
        } as CSSProperties
      }
    >
      {hasReservedLayout && (
        <span className={styles.reserveLayer} aria-hidden="true">
          {reservedTokens.map((token, index) =>
            renderChar(token, `reserve-${index}`, false)
          )}
        </span>
      )}
      <span className={hasReservedLayout ? styles.displayLayer : styles.inlineLayer}>
        {tokens.map((token, index) => renderChar(token, `display-${index}`, true))}
      </span>
    </h2>
  );
}
