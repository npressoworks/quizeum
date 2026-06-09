/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useSearchUrlState } from '@/hooks/useSearchUrlState';

const replace = jest.fn();
let searchParams = new URLSearchParams('tab=trending&genreId=programming');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

function Probe() {
  const { tab, filters, patchFilters } = useSearchUrlState();
  return (
    <div>
      <span data-testid="tab">{tab}</span>
      <span data-testid="genre">{filters.genreId}</span>
      <button type="button" onClick={() => patchFilters({ genreId: 'history' })}>
        change-genre
      </button>
    </div>
  );
}

describe('useSearchUrlState', () => {
  beforeEach(() => {
    replace.mockClear();
    searchParams = new URLSearchParams('tab=trending&genreId=programming');
  });

  it('URL から探索状態を復元する', () => {
    render(<Probe />);
    expect(screen.getByTestId('tab')).toHaveTextContent('trending');
    expect(screen.getByTestId('genre')).toHaveTextContent('programming');
  });

  it('フィルタ変更で router.replace を呼ぶ', () => {
    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'change-genre' }));
    expect(replace).toHaveBeenCalledWith('/search?tab=trending&genreId=history', {
      scroll: false,
    });
  });
});
