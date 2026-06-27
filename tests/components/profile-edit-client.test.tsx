/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProfileEditClient } from '@/app/profile/edit/profile-edit-client';
import { getUser, updateProfile } from '@/services/user';
import { useActiveGenres } from '@/hooks/useActiveGenres';

const mockPush = jest.fn();
const mockRouter = { push: mockPush };
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const mockCurrentUser = { id: 'user-1', displayName: '本人' };
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: mockCurrentUser, loading: false }),
}));

jest.mock('@/services/user', () => ({
  getUser: jest.fn().mockResolvedValue({
    id: 'user-1',
    displayName: 'テストユーザー',
    bio: 'プロフィール自己紹介',
    deleteStatus: 'active',
    followedGenres: ['genre-1'],
    snsLinks: { youtube: '', x: '', instagram: '', tiktok: '' },
  }),
  updateProfile: jest.fn(),
  validateProfileData: jest.fn().mockReturnValue([]),
}));

jest.mock('@/hooks/useActiveGenres', () => ({
  useActiveGenres: jest.fn().mockReturnValue({
    genres: [
      { id: 'genre-1', displayName: 'プログラミング', iconImageUrl: '/icons/prog.png' },
      { id: 'genre-2', displayName: '歴史', iconImageUrl: '' },
    ],
    loading: false,
    error: null,
    genreLabelById: new Map([
      ['genre-1', 'プログラミング'],
      ['genre-2', '歴史'],
    ]),
    refetch: jest.fn(),
  }),
}));

describe('ProfileEditClient - Genre Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ジャンル選択UIが表示され、初期データが選択されていること', async () => {
    render(<ProfileEditClient />);

    // ロード完了を待つ
    await waitFor(() => {
      expect(screen.getByText('プロフィールの編集')).toBeInTheDocument();
    });

    // ジャンル選択UIコンテナが存在すること
    const genreSelectContainer = screen.getByTestId('profile-genre-select');
    expect(genreSelectContainer).toBeInTheDocument();

    // ジャンルボタンが表示されていること
    const genreBtn1 = screen.getByRole('button', { name: /プログラミング/ });
    const genreBtn2 = screen.getByRole('button', { name: /歴史/ });
    expect(genreBtn1).toBeInTheDocument();
    expect(genreBtn2).toBeInTheDocument();
  });

  it('ジャンルのトグル選択と保存処理が正常に行われること', async () => {
    (updateProfile as jest.Mock).mockResolvedValue(true);
    render(<ProfileEditClient />);

    await waitFor(() => {
      expect(screen.getByText('プロフィールの編集')).toBeInTheDocument();
    });

    const genreBtn1 = screen.getByRole('button', { name: /プログラミング/ });
    const genreBtn2 = screen.getByRole('button', { name: /歴史/ });

    // 初期値のロードが完了し、スタイルが適用されるのを待つ
    await waitFor(() => {
      expect(genreBtn1).toHaveClass('bg-primary');
      expect(genreBtn2).not.toHaveClass('bg-primary');
    });

    // 初期値 'genre-1' が選択されている状態から、'genre-1' を解除し、'genre-2' を選択
    await act(async () => {
      fireEvent.click(genreBtn1);
    });
    await act(async () => {
      fireEvent.click(genreBtn2);
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByRole('button', { name: /保存/ });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith('user-1', {
        displayName: 'テストユーザー',
        bio: 'プロフィール自己紹介',
        followedGenres: ['genre-2'],
        snsLinks: { youtube: '', x: '', instagram: '', tiktok: '' },
      });
      expect(mockPush).toHaveBeenCalledWith('/profile/user-1');
    });
  });
});
