/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';

// Mock navigation
let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock auth context
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'user-1', displayName: 'Test User', avatarUrl: 'avatar.png' },
    loading: false,
  }),
}));

// Mock child components to verify layout wrapper structure
jest.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
jest.mock('@/components/layout/header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));
jest.mock('@/components/layout/bottom-nav', () => ({
  BottomNav: () => <div data-testid="bottom-nav">BottomNav</div>,
}));

describe('LayoutWrapper Component', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders children correctly', () => {
    render(
      <LayoutWrapper>
        <div data-testid="child-content">Content</div>
      </LayoutWrapper>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders sidebar, header, and bottom-nav on normal pages', () => {
    mockPathname = '/';
    render(
      <LayoutWrapper>
        <div>Content</div>
      </LayoutWrapper>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('does NOT render sidebar, header, and bottom-nav on play page', () => {
    mockPathname = '/play/quiz-1';
    render(
      <LayoutWrapper>
        <div>Content</div>
      </LayoutWrapper>
    );
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });
});
