import {
  areNumericAnswersEqual,
  getTextInputFieldProps,
  isTextInputAnswerCorrect,
  normalizeTextAnswer,
  parseNumericAnswer,
  resolveTextInputMode,
} from '../../src/services/text-answer-utils';
import { Question } from '../../src/types';

function makeTextQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: 'text-input',
    questionText: 'test',
    explanation: 'explanation',
    imageUrl: null,
    hint: null,
    limitTime: null,
    correctTextAnswerList: ['useState'],
    correctCount: 0,
    incorrectCount: 0,
    ...overrides,
  };
}

describe('text-answer-utils', () => {
  describe('normalizeTextAnswer', () => {
    it('trims, lowercases, and removes spaces', () => {
      expect(normalizeTextAnswer('  Use State  ')).toBe('usestate');
    });
  });

  describe('parseNumericAnswer', () => {
    it('parses integers and decimals', () => {
      expect(parseNumericAnswer('42')).toBe(42);
      expect(parseNumericAnswer('3.14')).toBe(3.14);
      expect(parseNumericAnswer('-2.5')).toBe(-2.5);
    });

    it('parses full-width digits and decimal point', () => {
      expect(parseNumericAnswer('３．１４')).toBe(3.14);
      expect(parseNumericAnswer('－１０')).toBe(-10);
    });

    it('strips commas and full-width spaces', () => {
      expect(parseNumericAnswer('1,000')).toBe(1000);
      expect(parseNumericAnswer('1,234.56')).toBe(1234.56);
      expect(parseNumericAnswer('　42　')).toBe(42);
    });

    it('returns null for non-numeric input', () => {
      expect(parseNumericAnswer('abc')).toBeNull();
      expect(parseNumericAnswer('')).toBeNull();
      expect(parseNumericAnswer('3.14.15')).toBeNull();
    });
  });

  describe('areNumericAnswersEqual', () => {
    it('treats near-equal floats as equal', () => {
      expect(areNumericAnswersEqual(3.14, 3.1400000000000001)).toBe(true);
      expect(areNumericAnswersEqual(42, 42.0)).toBe(true);
      expect(areNumericAnswersEqual(3.14, 3.15)).toBe(false);
    });
  });

  describe('isTextInputAnswerCorrect', () => {
    it('matches normalized text answers in text mode', () => {
      const q = makeTextQuestion({ correctTextAnswerList: ['Use State'] });
      expect(isTextInputAnswerCorrect('use state', q)).toBe(true);
      expect(isTextInputAnswerCorrect('wrong', q)).toBe(false);
    });

    it('compares numeric answers in numeric mode', () => {
      const q = makeTextQuestion({
        textInputMode: 'numeric',
        correctTextAnswerList: ['42', '42.0'],
      });
      expect(isTextInputAnswerCorrect('42', q)).toBe(true);
      expect(isTextInputAnswerCorrect('3.14', makeTextQuestion({
        textInputMode: 'numeric',
        correctTextAnswerList: ['3.14'],
      }))).toBe(true);
      expect(isTextInputAnswerCorrect('３．１４', makeTextQuestion({
        textInputMode: 'numeric',
        correctTextAnswerList: ['3.14'],
      }))).toBe(true);
      expect(isTextInputAnswerCorrect('1,000', makeTextQuestion({
        textInputMode: 'numeric',
        correctTextAnswerList: ['1000'],
      }))).toBe(true);
      expect(isTextInputAnswerCorrect('abc', q)).toBe(false);
    });

    it('requires exact character count in char-count mode', () => {
      const q = makeTextQuestion({
        textInputMode: 'char-count',
        textInputCharCount: 4,
        correctTextAnswerList: ['abcd', 'ABCD'],
      });
      expect(isTextInputAnswerCorrect('abcd', q)).toBe(true);
      expect(isTextInputAnswerCorrect('abc', q)).toBe(false);
      expect(isTextInputAnswerCorrect('abcde', q)).toBe(false);
    });
  });

  describe('getTextInputFieldProps', () => {
    it('returns numeric placeholder for numeric mode', () => {
      expect(getTextInputFieldProps({ textInputMode: 'numeric' }).placeholder).toContain('小数');
    });

    it('returns length constraints for char-count mode', () => {
      const props = getTextInputFieldProps({ textInputMode: 'char-count', textInputCharCount: 5 });
      expect(props.maxLength).toBe(5);
      expect(props.minLength).toBe(5);
      expect(props.placeholder).toContain('5文字');
    });
  });

  describe('resolveTextInputMode', () => {
    it('defaults to text when unset', () => {
      expect(resolveTextInputMode({})).toBe('text');
    });
  });
});
