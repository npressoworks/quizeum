import { listActiveTags } from '../../src/services/quiz';
import { getDocs } from 'firebase/firestore';
import type { TagMetadata } from '../../src/types';

jest.mock('../../src/lib/firebase/config', () => ({ db: {} }));

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    collection: jest.fn((_db, path) => ({ path })),
    query: jest.fn((ref, ...clauses) => ({ ref, clauses })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    getDocs: jest.fn(),
  };
});

describe('listActiveTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('存続タグのみ返し tagName でソートする', async () => {
    const rows: Array<{ id: string; data: () => TagMetadata }> = [
      {
        id: 'web',
        data: () =>
          ({
            id: 'web',
            tagName: 'Web開発',
            canonicalId: null,
            mergedTagIds: [],
          }) as TagMetadata,
      },
      {
        id: 'js',
        data: () =>
          ({
            id: 'js',
            tagName: 'JavaScript',
            canonicalId: null,
            mergedTagIds: [],
          }) as TagMetadata,
      },
    ];

    (getDocs as jest.Mock).mockResolvedValue({ docs: rows });

    const result = await listActiveTags();

    expect(getDocs).toHaveBeenCalled();
    const queryArg = (getDocs as jest.Mock).mock.calls[0][0];
    expect(queryArg.clauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'canonicalId', op: '==', value: null }),
      ])
    );

    expect(result.map((t) => t.id)).toEqual(['js', 'web']);
    expect(result.every((t) => t.canonicalId === null)).toBe(true);
  });

  test('0 件時は空配列', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    const result = await listActiveTags();
    expect(result).toEqual([]);
  });

  test('読み取り失敗時は例外を伝播する', async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error('firestore unavailable'));
    await expect(listActiveTags()).rejects.toThrow('firestore unavailable');
  });
});
