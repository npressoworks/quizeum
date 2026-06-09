import {
  createTrueFalseChoices,
  findTrueFalseChoiceId,
  isBatsuLabel,
  isMaruLabel,
  normalizeTrueFalseChoices,
  resolveTrueFalseCorrectSide,
  TRUE_FALSE_LABELS,
} from '@/lib/true-false-defaults';

describe('true-false-defaults', () => {
  it('creates maru-correct choices', () => {
    const choices = createTrueFalseChoices('maru');
    expect(choices).toHaveLength(2);
    expect(choices[0].choiceText).toBe(TRUE_FALSE_LABELS.maru);
    expect(choices[0].isCorrect).toBe(true);
    expect(choices[1].choiceText).toBe(TRUE_FALSE_LABELS.batsu);
    expect(choices[1].isCorrect).toBe(false);
  });

  it('creates batsu-correct choices', () => {
    const choices = createTrueFalseChoices('batsu');
    expect(choices[1].isCorrect).toBe(true);
    expect(choices[0].isCorrect).toBe(false);
  });

  it('preserves existing choice ids on normalize', () => {
    const normalized = normalizeTrueFalseChoices(
      [
        { id: 'legacy-true', choiceText: '○', isCorrect: true, selectedCount: 0 },
        { id: 'legacy-false', choiceText: '×', isCorrect: false, selectedCount: 0 },
      ],
      'maru'
    );
    expect(normalized[0].id).toBe('legacy-true');
    expect(normalized[1].id).toBe('legacy-false');
    expect(normalized[0].choiceText).toBe('〇');
    expect(normalized[1].choiceText).toBe('✕');
  });

  it('resolves correct side from legacy labels', () => {
    expect(
      resolveTrueFalseCorrectSide([
        { id: 'a', choiceText: '○', isCorrect: false, selectedCount: 0 },
        { id: 'b', choiceText: '×', isCorrect: true, selectedCount: 0 },
      ])
    ).toBe('batsu');
  });

  it('finds choice id by side with legacy labels', () => {
    const choices = [
      { id: 'opt-true', choiceText: '〇', isCorrect: false, selectedCount: 0 },
      { id: 'opt-false', choiceText: '✕', isCorrect: true, selectedCount: 0 },
    ];
    expect(findTrueFalseChoiceId(choices, 'maru')).toBe('opt-true');
    expect(findTrueFalseChoiceId(choices, 'batsu')).toBe('opt-false');
  });

  it('recognizes label variants', () => {
    expect(isMaruLabel('○')).toBe(true);
    expect(isBatsuLabel('×')).toBe(true);
    expect(isMaruLabel('正解')).toBe(false);
  });
});
