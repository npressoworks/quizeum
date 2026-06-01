import { Question } from '@/types';

/** 選択式の解答をカンマ区切りの Choice ID 列として保存・送信する */
export function serializeChoiceAnswerIds(ids: string[]): string {
  return ids.filter(Boolean).join(',');
}

export function parseChoiceAnswerIds(rawAnswer: string): string[] {
  if (!rawAnswer) return [];
  if (!rawAnswer.includes(',')) return [rawAnswer];
  return rawAnswer.split(',').map((id) => id.trim()).filter(Boolean);
}

export function getCorrectChoiceIds(question: Question): string[] {
  return (question.choices ?? []).filter((c) => c.isCorrect).map((c) => c.id);
}

export function isMultiCorrectChoiceQuestion(question: Question): boolean {
  return getCorrectChoiceIds(question).length > 1;
}

export function isChoiceAnswerCorrect(rawAnswer: string, question: Question): boolean {
  const correctIds = getCorrectChoiceIds(question).sort();
  if (correctIds.length === 0) return false;

  const selectedIds = parseChoiceAnswerIds(rawAnswer).sort();
  if (selectedIds.length !== correctIds.length) return false;

  return correctIds.every((id, idx) => id === selectedIds[idx]);
}
