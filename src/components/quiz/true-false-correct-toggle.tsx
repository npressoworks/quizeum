'use client';

import React from 'react';
import { TrueFalseCorrectSide, TRUE_FALSE_LABELS } from '@/lib/true-false-defaults';
import styles from './true-false-correct-toggle.module.css';

type TrueFalseCorrectToggleProps = {
  value: TrueFalseCorrectSide;
  onChange: (side: TrueFalseCorrectSide) => void;
  disabled?: boolean;
};

export function TrueFalseCorrectToggle({
  value,
  onChange,
  disabled = false,
}: TrueFalseCorrectToggleProps) {
  return (
    <div className={styles.toggle} data-testid="true-false-correct-toggle">
      <p className={styles.label}>正解を選択</p>
      <div className={styles.buttons} role="group" aria-label="正解の選択">
        <button
          type="button"
          className={`${styles.btn} ${value === 'maru' ? styles.btnActive : ''}`}
          onClick={() => onChange('maru')}
          disabled={disabled}
          aria-pressed={value === 'maru'}
        >
          <span className={styles.symbol}>{TRUE_FALSE_LABELS.maru}</span>
          <span className={styles.caption}>が正解</span>
        </button>
        <button
          type="button"
          className={`${styles.btn} ${value === 'batsu' ? styles.btnActive : ''}`}
          onClick={() => onChange('batsu')}
          disabled={disabled}
          aria-pressed={value === 'batsu'}
        >
          <span className={styles.symbol}>{TRUE_FALSE_LABELS.batsu}</span>
          <span className={styles.caption}>が正解</span>
        </button>
      </div>
    </div>
  );
}
