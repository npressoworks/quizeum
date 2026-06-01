import { Question } from '@/types';

const DEFAULT_TEXT_ANSWER = '正解テキスト';
const DEFAULT_ASSOCIATION_HINT = 'ヒント 1';
const DEFAULT_MULTIPLE_CHOICE_COUNT = 4;
const DEFAULT_SORTING_ITEM_COUNT = 2;

function hasMultipleChoiceUserInput(q: Question): boolean {
  if (!q.choices) return false;
  if (q.choices.length !== DEFAULT_MULTIPLE_CHOICE_COUNT) return true;
  if (q.choices.some((choice, idx) => choice.isCorrect !== (idx === 0))) return true;
  return q.choices.some((choice, idx) => choice.choiceText !== `選択肢 ${idx + 1}`);
}

function hasTextAnswerUserInput(q: Question): boolean {
  const answers = q.correctTextAnswerList ?? [];
  if (answers.length !== 1) return true;
  return answers[0] !== DEFAULT_TEXT_ANSWER;
}

function hasSortingUserInput(q: Question): boolean {
  const items = q.sortingItems ?? [];
  if (items.length !== DEFAULT_SORTING_ITEM_COUNT) return true;
  if (items.some((item, idx) => item.text !== `要素 ${idx + 1}`)) return true;
  return items.some((item, idx) => item.correctOrder !== idx);
}

function hasAssociationUserInput(q: Question): boolean {
  const hints = q.associationHints ?? [];
  const answers = q.correctTextAnswerList ?? [];
  if (hints.length !== 1 || hints[0] !== DEFAULT_ASSOCIATION_HINT) return true;
  return answers.length !== 1 || answers[0] !== DEFAULT_TEXT_ANSWER;
}

function hasLateralThinkingUserInput(q: Question): boolean {
  if (q.aiContextDetails?.trim()) return true;
  return (q.truthKeywords?.length ?? 0) > 0;
}

/** 設問にユーザー入力（初期値以外の内容）があるか判定する */
export function hasQuestionUserInput(q: Question): boolean {
  if (q.questionText.trim()) return true;
  if (q.explanation.trim()) return true;
  if (q.imageUrl) return true;
  if (q.hint?.trim()) return true;
  if (q.limitTime != null) return true;

  switch (q.type) {
    case 'multiple-choice':
    case 'true-false':
      return hasMultipleChoiceUserInput(q);
    case 'text-input':
    case 'quick-press':
      return hasTextAnswerUserInput(q);
    case 'sorting':
      return hasSortingUserInput(q);
    case 'association':
      return hasAssociationUserInput(q);
    case 'lateral-thinking':
      return hasLateralThinkingUserInput(q);
    default:
      return false;
  }
}

export function hasAnyQuestionUserInput(questions: Question[]): boolean {
  return questions.some(hasQuestionUserInput);
}
