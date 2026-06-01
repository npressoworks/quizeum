import { Question, TextInputMode } from '@/types';

export const MIN_TEXT_INPUT_CHAR_COUNT = 1;
export const MAX_TEXT_INPUT_CHAR_COUNT = 100;

/** 記述式の入力モード（未設定時は通常テキスト） */
export function resolveTextInputMode(question: Pick<Question, 'textInputMode'>): TextInputMode {
  return question.textInputMode ?? 'text';
}

/** 記述式の正規化（通常・文字数指定） */
export function normalizeTextAnswer(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '');
}

/** 数値比較の許容誤差（浮動小数点の誤差吸収） */
export const NUMERIC_ANSWER_EPSILON = 1e-9;

/** 数値入力文字列の正規化（全角数字・小数点・マイナス、カンマ除去） */
export function normalizeNumericInputString(input: string): string {
  return input
    .trim()
    .replace(/　/g, '')
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/．/g, '.')
    .replace(/[－−]/g, '-')
    .replace(/,/g, '');
}

/** 数値回答のパース（整数・小数、全角数字対応） */
export function parseNumericAnswer(input: string): number | null {
  const cleaned = normalizeNumericInputString(input);
  if (cleaned === '' || cleaned === '-' || cleaned === '+') return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num;
}

/** 数値回答の等価判定（小数の浮動誤差を許容） */
export function areNumericAnswersEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < NUMERIC_ANSWER_EPSILON;
}

export function isValidNumericAnswerText(input: string): boolean {
  return parseNumericAnswer(input) !== null;
}

/** 記述式の正誤判定 */
export function isTextInputAnswerCorrect(
  rawInput: string,
  question: Pick<Question, 'correctTextAnswerList' | 'textInputMode' | 'textInputCharCount'>
): boolean {
  const correctList = question.correctTextAnswerList ?? [];
  if (correctList.length === 0) return false;

  const mode = resolveTextInputMode(question);

  if (mode === 'char-count') {
    const expectedLen = question.textInputCharCount;
    if (
      expectedLen == null ||
      expectedLen < MIN_TEXT_INPUT_CHAR_COUNT ||
      expectedLen > MAX_TEXT_INPUT_CHAR_COUNT
    ) {
      return false;
    }
    if (rawInput.length !== expectedLen) return false;
  }

  if (mode === 'numeric') {
    const userNum = parseNumericAnswer(rawInput);
    if (userNum === null) return false;
    return correctList.some((ans) => {
      const correctNum = parseNumericAnswer(ans);
      return correctNum !== null && areNumericAnswersEqual(userNum, correctNum);
    });
  }

  const cleanInput = normalizeTextAnswer(rawInput);
  return correctList.some((ans) => normalizeTextAnswer(ans) === cleanInput);
}

export function getTextInputFieldProps(
  question: Pick<Question, 'textInputMode' | 'textInputCharCount'>,
  options?: { placeholder?: string }
): {
  type: 'text';
  inputMode?: 'text' | 'decimal';
  maxLength?: number;
  minLength?: number;
  placeholder: string;
  pattern?: string;
} {
  const mode = resolveTextInputMode(question);

  if (mode === 'numeric') {
    return {
      type: 'text',
      inputMode: 'decimal',
      placeholder: options?.placeholder ?? '整数・小数を入力してください...',
    };
  }

  if (mode === 'char-count' && question.textInputCharCount) {
    const n = question.textInputCharCount;
    return {
      type: 'text',
      maxLength: n,
      minLength: n,
      placeholder: `${n}文字で入力してください...`,
    };
  }

  return {
    type: 'text',
    placeholder: '回答を入力してください...',
  };
}
