/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BottomNav } from '@/components/layout/bottom-nav';

// Mock navigation
let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock auth context
let mockUser: any = null;
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

describe('BottomNav Component', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockUser = null;
  });

  it('未ログイン時はホームへのリンクのみを表示する', () => {
    mockUser = null;
    render(<BottomNav />);
    
    expect(screen.getByRole('link')).toBeInTheDocument();
    // ラベルが存在しないか、もしくはアイコンのaria-label/テキストなどで「ホーム」のみであることを確認
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(1);
    expect(screen.getByTestId('bottom-nav-home')).toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav-notifications')).not.toBeInTheDocument();
  });

  it('ログイン時はホーム、通知、ブックマーク、プロフィールの4リンクを表示する', () => {
    mockUser = { id: 'user-123', avatarUrl: 'avatar.png' };
    render(<BottomNav />);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(4);
    
    expect(screen.getByTestId('bottom-nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav-bookmarks')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav-profile')).toBeInTheDocument();
  });

  it('アクティブなパスに合致するアイテムがハイライト表示される', () => {
    mockUser = { id: 'user-123', avatarUrl: 'avatar.png' };
    mockPathname = '/notifications';
    render(<BottomNav />);
    
    const activeLink = screen.getByTestId('bottom-nav-notifications');
    expect(activeLink).toHaveClass('active');
  });
});
