import { getFollowerUsers, getFollowingUsers } from '@/services/user';
import { documentId, getDocs, where } from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('../../tests/__mocks__/firebase/firestore.ts');
  return {
    ...original,
    query: jest.fn((_ref, ...clauses) => ({ clauses })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    getDocs: jest.fn(),
  };
});

function makeQuerySnapshot(docs: Array<{ data: () => unknown }>) {
  return {
    docs,
    forEach: (fn: (doc: { data: () => unknown }) => void) => docs.forEach(fn),
  };
}

function makeUserDoc(id: string, displayName: string) {
  return {
    data: () => ({
      id,
      email: `${id}@example.com`,
      displayName,
      avatarUrl: '',
      bio: '',
      followedGenres: [],
      badges: [],
      createdQuizzesCount: 0,
      totalPlayCount: 0,
      followersCount: 0,
      followingCount: 0,
      reputationScore: 0,
      moderationTier: 'newcomer' as const,
      reputationHistory: [],
      lastReputationCalculatedAt: null,
      totalFailedQuestionsCount: 0,
      deleteStatus: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };
}

describe('user connections service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (documentId as jest.Mock).mockReturnValue('__documentId__');
  });

  it('getFollowerUsers は documentId() でユーザーを解決する', async () => {
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({
        docs: [{ data: () => ({ followerId: 'follower-1', followingId: 'target-1' }) }],
      })
      .mockResolvedValueOnce(makeQuerySnapshot([makeUserDoc('follower-1', 'フォロワーA')]));

    const users = await getFollowerUsers('target-1');

    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('follower-1');
    expect(users[0].displayName).toBe('フォロワーA');
    expect(where).toHaveBeenCalledWith('__documentId__', 'in', ['follower-1']);
    expect(where).not.toHaveBeenCalledWith('id', 'in', expect.anything());
  });

  it('getFollowingUsers は documentId() でユーザーを解決する', async () => {
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({
        docs: [{ data: () => ({ followerId: 'target-1', followingId: 'following-1' }) }],
      })
      .mockResolvedValueOnce(makeQuerySnapshot([makeUserDoc('following-1', 'フォロー先B')]));

    const users = await getFollowingUsers('target-1');

    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('following-1');
    expect(users[0].displayName).toBe('フォロー先B');

    expect(where).toHaveBeenCalledWith('__documentId__', 'in', ['following-1']);
    expect(where).not.toHaveBeenCalledWith('id', 'in', expect.anything());
  });

  it('フォロー関係がない場合は空配列を返す', async () => {
    (getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] });

    await expect(getFollowerUsers('target-1')).resolves.toEqual([]);
    expect(getDocs).toHaveBeenCalledTimes(1);
  });
});
