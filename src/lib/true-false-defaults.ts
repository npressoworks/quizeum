import { Choice } from '@/types';

export type TrueFalseCorrectSide = 'maru' | 'batsu';

export const TRUE_FALSE_LABELS = {
  maru: '〇',
  batsu: '✕',
} as const;

const MARU_VARIANTS = new Set(['〇', '○', '⭕', 'O', 'o']);
const BATSU_VARIANTS = new Set(['✕', '×', '╳', '✖', 'X', 'x']);

export function isMaruLabel(text: string): boolean {
  return MARU_VARIANTS.has(text.trim());
}

export function isBatsuLabel(text: string): boolean {
  return BATSU_VARIANTS.has(text.trim());
}

export function createTrueFalseChoices(
  correctSide: TrueFalseCorrectSide,
  existingIds?: { maruId?: string; batsuId?: string }
): Choice[] {
  return [
    {
      id: existingIds?.maruId ?? 'tf-maru',
      choiceText: TRUE_FALSE_LABELS.maru,
      isCorrect: correctSide === 'maru',
      selectedCount: 0,
    },
    {
      id: existingIds?.batsuId ?? 'tf-batsu',
      choiceText: TRUE_FALSE_LABELS.batsu,
      isCorrect: correctSide === 'batsu',
      selectedCount: 0,
    },
  ];
}

export function resolveTrueFalseCorrectSide(choices: Choice[] | undefined): TrueFalseCorrectSide {
  if (!choices?.length) return 'maru';

  const correct = choices.filter((c) => c.isCorrect);
  if (correct.length === 1) {
    if (isBatsuLabel(correct[0].choiceText)) return 'batsu';
    if (isMaruLabel(correct[0].choiceText)) return 'maru';
  }

  const maru = choices.find((c) => isMaruLabel(c.choiceText));
  const batsu = choices.find((c) => isBatsuLabel(c.choiceText));
  if (batsu?.isCorrect) return 'batsu';
  if (maru?.isCorrect) return 'maru';

  const correctIdx = choices.findIndex((c) => c.isCorrect);
  return correctIdx === 1 ? 'batsu' : 'maru';
}

export function normalizeTrueFalseChoices(
  choices: Choice[] | undefined,
  correctSide?: TrueFalseCorrectSide
): Choice[] {
  const side = correctSide ?? resolveTrueFalseCorrectSide(choices);
  const maruExisting = choices?.find((c) => isMaruLabel(c.choiceText));
  const batsuExisting = choices?.find((c) => isBatsuLabel(c.choiceText));
  return createTrueFalseChoices(side, {
    maruId: maruExisting?.id,
    batsuId: batsuExisting?.id,
  });
}

export function findTrueFalseChoiceId(
  choices: Choice[] | undefined,
  side: TrueFalseCorrectSide
): string | undefined {
  if (!choices?.length) return undefined;
  const matcher = side === 'maru' ? isMaruLabel : isBatsuLabel;
  return choices.find((c) => matcher(c.choiceText))?.id;
}
