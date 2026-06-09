'use client';

import React, { useState } from 'react';
import {
  addQuestionToList,
  removeQuestionFromList,
} from '@/services/question';
import {
  getQuestionsInList,
  reorderQuestionList,
  type QuestionInListEntry,
} from '@/services/quiz-list';
import {
  useQuestionAttachSearch,
  type QuestionAttachTab,
} from '@/hooks/useQuestionAttachSearch';
import { listEditorClasses as styles } from '@/components/quiz-list/list-editor-classes';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GripVertical, Plus, Search, Trash2 } from 'lucide-react';

export interface QuestionListAttachPanelProps {
  listId: string;
  authorId: string;
  attached: QuestionInListEntry[];
  onAttachedChange: (entries: QuestionInListEntry[]) => void;
  disabled?: boolean;
}

const TABS: { id: QuestionAttachTab; label: string }[] = [
  { id: 'own-published', label: '自作（公開）' },
  { id: 'bookmarked', label: 'ブックマーク' },
  { id: 'public-explore', label: '公開探索' },
];

export function QuestionListAttachPanel({
  listId,
  authorId,
  attached,
  onAttachedChange,
  disabled = false,
}: QuestionListAttachPanelProps) {
  const [activeTab, setActiveTab] = useState<QuestionAttachTab>('own-published');
  const [attachError, setAttachError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { keyword, setKeyword, candidates, loading, error } = useQuestionAttachSearch(
    authorId,
    activeTab
  );

  const attachedIds = new Set(attached.map((e) => e.question.id));

  const refreshAttached = async () => {
    const entries = await getQuestionsInList(listId);
    onAttachedChange(entries);
  };

  const handleAttach = async (questionId: string) => {
    if (disabled) return;
    setAttachError(null);
    try {
      await addQuestionToList(listId, questionId);
      await refreshAttached();
    } catch (e) {
      setAttachError(e instanceof Error ? e.message : '問題の追加に失敗しました');
    }
  };

  const handleDetach = async (questionId: string) => {
    setAttachError(null);
    try {
      await removeQuestionFromList(listId, questionId);
      await refreshAttached();
    } catch (e) {
      setAttachError(e instanceof Error ? e.message : '問題の削除に失敗しました');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || disabled) return;

    const next = [...attached];
    const [item] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, item);
    setDraggedIndex(null);

    const newOrder = next.map((entry) => entry.question.id);
    try {
      await reorderQuestionList(listId, newOrder);
      onAttachedChange(next);
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : '並び替えに失敗しました');
      await refreshAttached();
    }
  };

  const panelDisabled = disabled;

  return (
    <div data-testid="question-list-attach-panel">
      {panelDisabled && (
        <p
          className="mb-3 text-sm text-muted-foreground"
          data-testid="question-attach-disabled-hint"
        >
          リストを一度保存すると、問題の検索・アタッチが有効になります。
        </p>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as QuestionAttachTab)}
        className="mb-3"
      >
        <TabsList className="h-auto flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs"
              data-testid={`question-attach-tab-${tab.id}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeTab === 'public-explore' && (
        <p className="mb-2 text-xs text-muted-foreground">
          探索は直近公開クイズの問題から検索します（全件保証なし）
        </p>
      )}

      <div className={`${styles.searchBar} mb-3`}>
        <input
          type="text"
          className={styles.input}
          placeholder="問題文・親クイズタイトルで検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={panelDisabled}
          data-testid="question-attach-keyword"
        />
        <span className="p-2.5 opacity-60">
          <Search size={16} />
        </span>
      </div>

      {(attachError || error) && (
        <p role="alert" className="mb-2 text-sm text-destructive">
          {attachError || error}
        </p>
      )}

      <div className={`${styles.searchList} mb-5 max-h-[220px]`}>
        {loading ? (
          <span className="text-sm text-muted-foreground">読み込み中...</span>
        ) : candidates.length === 0 ? (
          <span className="text-sm text-muted-foreground">該当する問題がありません</span>
        ) : (
          candidates.map((c) => (
            <div key={c.questionId} className={styles.searchItem}>
              <div className={styles.searchItemInfo}>
                <span className={styles.searchItemTitle}>{c.questionText.slice(0, 80)}</span>
                <span className={styles.searchItemMeta}>{c.parentQuizTitle}</span>
              </div>
              <button
                type="button"
                className={styles.attachBtn}
                disabled={panelDisabled || attachedIds.has(c.questionId)}
                onClick={() => handleAttach(c.questionId)}
                data-testid={`attach-question-${c.questionId}`}
              >
                <Plus size={14} /> 追加
              </button>
            </div>
          ))
        )}
      </div>

      <span className={`${styles.label} mb-2 block`}>
        アタッチ済み問題
      </span>
      <div className={styles.attachedList}>
        {attached.length === 0 ? (
          <span className="text-sm text-muted-foreground">まだ問題がありません</span>
        ) : (
          attached.map((entry, idx) => (
            <div
              key={entry.question.id}
              className={`${styles.attachedItem} ${draggedIndex === idx ? styles.attachedItemDragging : ''}`}
              draggable={!panelDisabled}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              data-testid={`attached-question-${entry.question.id}`}
            >
              <div className={styles.attachedItemLeft}>
                <div className={styles.dragHandle}>
                  <GripVertical size={16} />
                </div>
                <span className="text-sm font-extrabold text-primary">#{idx + 1}</span>
                <div>
                  <div className={styles.attachedItemTitle}>
                    {entry.question.questionText.slice(0, 60)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.parentQuizTitle}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.detachBtn}
                onClick={() => handleDetach(entry.question.id)}
                title="リストから除外"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
