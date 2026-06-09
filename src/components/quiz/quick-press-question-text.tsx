'use client';

import type { CSSProperties } from 'react';
import type { QuickPressCharToken } from '@/lib/quick-press-plain-text';
import { QUICK_PRESS_WIPE_CHAR_MS } from '@/lib/quick-press-stream-config';
import { cn } from '@/lib/utils';
import { quickPressClasses as styles } from './quick-press-classes';

type QuickPressQuestionTextProps = {
  tokens: QuickPressCharToken[];
  reservedTokens?: QuickPressCharToken[];
  className?: string;
};

const NORMAL_GRADIENT =
  'linear-gradient(to right, var(--foreground) 50%, transparent 50%)';
const BOLD_GRADIENT =
  'linear-gradient(to right, var(--primary) 50%, transparent 50%)';

function renderChar(token: QuickPressCharToken, key: string, animated: boolean) {
  return (
    <span
      key={key}
      className={cn(
        styles.char,
        token.bold && styles.charBold,
        animated ? cn(styles.charAnimated, 'animate-quick-press-wipe bg-clip-text text-transparent') : styles.charReserved
      )}
      style={
        animated
          ? {
              backgroundImage: token.bold ? BOLD_GRADIENT : NORMAL_GRADIENT,
              backgroundSize: '200% 100%',
              backgroundPosition: '100% 0',
            }
          : undefined
      }
    >
      {token.char === ' ' ? '\u00A0' : token.char}
    </span>
  );
}

export function QuickPressQuestionText({
  tokens,
  reservedTokens = [],
  className,
}: QuickPressQuestionTextProps) {
  const hasReservedLayout = reservedTokens.length > 0;

  return (
    <h2
      className={cn(
        'w-full max-w-full text-[1.85rem] leading-[1.45] wrap-break-word text-foreground',
        styles.root,
        hasReservedLayout && styles.rootReserved,
        className
      )}
      style={{ '--quick-press-wipe-ms': `${QUICK_PRESS_WIPE_CHAR_MS}ms` } as CSSProperties}
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
