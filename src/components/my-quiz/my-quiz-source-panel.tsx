'use client';

import React from 'react';
import type { MyQuizSourceFlags } from '@/lib/my-quiz-pool';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MyQuizSourcePanelProps {
  flags: MyQuizSourceFlags;
  onChange: (flags: MyQuizSourceFlags) => void;
}

const SOURCES: { key: keyof MyQuizSourceFlags; label: string; testId: string }[] = [
  { key: 'ownQuizzes', label: '自作クイズ', testId: 'my-quiz-source-own' },
  { key: 'bookmarkedQuizzes', label: 'ブックマーククイズ', testId: 'my-quiz-source-bookmarked-quiz' },
  { key: 'bookmarkedLists', label: 'ブックマークリスト内クイズ', testId: 'my-quiz-source-bookmarked-list' },
  { key: 'bookmarkedQuestions', label: 'ブックマーク問題', testId: 'my-quiz-source-bookmarked-question' },
];

export function MyQuizSourcePanel({ flags, onChange }: MyQuizSourcePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>取得元</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2" role="group" aria-label="問題の取得元">
          {SOURCES.map((src) => (
            <Toggle
              key={src.key}
              variant="outline"
              pressed={flags[src.key]}
              onPressedChange={(pressed) => onChange({ ...flags, [src.key]: pressed })}
              data-testid={src.testId}
              aria-pressed={flags[src.key]}
            >
              {src.label}
            </Toggle>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
