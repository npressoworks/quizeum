'use client';

import React from 'react';
import { TrueFalseCorrectSide, TRUE_FALSE_LABELS } from '@/lib/true-false-defaults';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col gap-2" data-testid="true-false-correct-toggle">
      <p className="text-sm font-medium text-muted-foreground">正解を選択</p>
      <div className="flex gap-2" role="group" aria-label="正解の選択">
        <Button
          type="button"
          variant={value === 'maru' ? 'default' : 'outline'}
          className={cn('h-auto flex-1 flex-col gap-1 py-3')}
          onClick={() => onChange('maru')}
          disabled={disabled}
          aria-pressed={value === 'maru'}
        >
          <span className="text-2xl leading-none">{TRUE_FALSE_LABELS.maru}</span>
          <span className="text-xs">が正解</span>
        </Button>
        <Button
          type="button"
          variant={value === 'batsu' ? 'default' : 'outline'}
          className={cn('h-auto flex-1 flex-col gap-1 py-3')}
          onClick={() => onChange('batsu')}
          disabled={disabled}
          aria-pressed={value === 'batsu'}
        >
          <span className="text-2xl leading-none">{TRUE_FALSE_LABELS.batsu}</span>
          <span className="text-xs">が正解</span>
        </Button>
      </div>
    </div>
  );
}
