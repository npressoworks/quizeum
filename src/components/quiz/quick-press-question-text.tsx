'use client';

import type { CSSProperties } from 'react';
import type { QuickPressCharToken } from '@/lib/quick-press-plain-text';
import { QUICK_PRESS_WIPE_CHAR_MS } from '@/lib/quick-press-stream-config';
import styles from './quick-press-question-text.module.css';

type QuickPressQuestionTextProps = {
  tokens: QuickPressCharToken[];
  className?: string;
};

const NORMAL_GRADIENT =
  'linear-gradient(to right, var(--text-main) 50%, rgba(243, 240, 252, 0) 50%)';
const BOLD_GRADIENT =
  'linear-gradient(to right, var(--color-accent) 50%, rgba(0, 245, 212, 0) 50%)';

/**
 * 早押し問題文: ストリームで届いたトークンを1文字ずつ左ワイプで表示する。
 */
export function QuickPressQuestionText({
  tokens,
  className,
}: QuickPressQuestionTextProps) {
  return (
    <h2
      className={`${className ?? ''} ${styles.root}`}
      style={
        {
          '--quick-press-wipe-ms': `${QUICK_PRESS_WIPE_CHAR_MS}ms`,
        } as CSSProperties
      }
    >
      {tokens.map((token, index) => (
        <span
          key={index}
          className={`${styles.char} ${token.bold ? styles.charBold : ''}`}
          style={{
            backgroundImage: token.bold ? BOLD_GRADIENT : NORMAL_GRADIENT,
            backgroundSize: '200% 100%',
          }}
        >
          {token.char === ' ' ? '\u00A0' : token.char}
        </span>
      ))}
    </h2>
  );
}
