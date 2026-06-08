'use client';

import React from 'react';
import styles from './number-stepper.module.css';

interface NumberStepperProps {
  /** 現在値 */
  value: number;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** ステップ幅 */
  step?: number;
  /** 値変更時コールバック */
  onChange: (value: number) => void;
  /** aria-label */
  label?: string;
}

/**
 * モダンな数値ステッパーコンポーネント。
 * ブラウザのデフォルトスピナーを非表示にし、カスタムの増減ボタンを提供します。
 */
export function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: NumberStepperProps) {
  const canDecrement = min === undefined || value - step >= min;
  const canIncrement = max === undefined || value + step <= max;

  const handleDecrement = () => {
    if (!canDecrement) return;
    onChange(value - step);
  };

  const handleIncrement = () => {
    if (!canIncrement) return;
    onChange(value + step);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (isNaN(raw)) return;
    // min/max の範囲内にクランプ
    const clamped =
      min !== undefined && max !== undefined
        ? Math.min(max, Math.max(min, raw))
        : min !== undefined
          ? Math.max(min, raw)
          : max !== undefined
            ? Math.min(max, raw)
            : raw;
    onChange(clamped);
  };

  return (
    <div className={styles.wrapper} role="group" aria-label={label}>
      {/* 減算ボタン */}
      <button
        type="button"
        className={styles.btn}
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label={`${label ?? '値'}を減らす`}
      >
        −
      </button>

      {/* 数値入力 */}
      <input
        type="number"
        className={styles.input}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleInputChange}
        aria-label={label}
      />

      {/* 加算ボタン */}
      <button
        type="button"
        className={styles.btn}
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label={`${label ?? '値'}を増やす`}
      >
        ＋
      </button>
    </div>
  );
}
