'use client';

import React from 'react';
import type { MyQuizPlaySettingsState } from '@/hooks/useMyQuizPool';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MyQuizPlaySettingsProps {
  settings: MyQuizPlaySettingsState;
  filteredCount: number;
  effectivePlayCount: number;
  poolLoading?: boolean;
  onChange: (settings: MyQuizPlaySettingsState) => void;
}

const PRESETS: { value: MyQuizPlaySettingsState['countPreset']; label: string }[] = [
  { value: '10', label: '10問' },
  { value: '20', label: '20問' },
  { value: 'all', label: '全件' },
  { value: 'custom', label: 'カスタム' },
];

export function MyQuizPlaySettings({
  settings,
  filteredCount,
  effectivePlayCount,
  poolLoading = false,
  onChange,
}: MyQuizPlaySettingsProps) {
  const clamped =
    settings.countPreset !== 'all' &&
    effectivePlayCount <
      (settings.countPreset === 'custom' ? settings.customCount : Number(settings.countPreset));

  return (
    <Card data-testid="my-quiz-play-settings">
      <CardHeader>
        <CardTitle>出題設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup
          value={[settings.countPreset]}
          onValueChange={(values) => {
            const next = values[values.length - 1];
            if (next) {
              onChange({ ...settings, countPreset: next as MyQuizPlaySettingsState['countPreset'] });
            }
          }}
          className="flex flex-wrap"
          aria-label="出題数"
        >
          {PRESETS.map((p) => (
            <ToggleGroupItem key={p.value} value={p.value}>
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {settings.countPreset === 'custom' && (
          <Input
            type="number"
            min={1}
            className="max-w-[200px]"
            value={settings.customCount}
            onChange={(e) =>
              onChange({ ...settings, customCount: Math.max(1, Number(e.target.value) || 1) })
            }
            data-testid="my-quiz-custom-count"
          />
        )}

        <div className="flex items-center gap-3">
          <Switch
            id="my-quiz-shuffle"
            checked={settings.shuffle}
            onCheckedChange={(checked) => onChange({ ...settings, shuffle: checked })}
            data-testid="my-quiz-shuffle-toggle"
          />
          <Label htmlFor="my-quiz-shuffle">シャッフルして出題</Label>
        </div>

        {!poolLoading && (
          <p className="text-sm text-muted-foreground" data-testid="my-quiz-question-count-preview">
            対象 {filteredCount} 問 / 出題 {effectivePlayCount} 問
            {clamped && filteredCount > 0 && (
              <span className="mt-1 block text-xs text-primary">
                （プール件数に合わせて自動調整）
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
