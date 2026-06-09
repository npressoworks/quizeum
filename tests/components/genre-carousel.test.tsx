/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GenreCarousel } from '@/components/explore/genre-carousel';

const genres = [
  {
    id: 'programming',
    displayName: 'コンピュータ・IT',
    iconImageUrl: null,
    canonicalId: null,
    mergedGenreIds: [],
    isActive: true,
  },
  {
    id: 'history',
    displayName: '歴史',
    iconImageUrl: null,
    canonicalId: null,
    mergedGenreIds: [],
    isActive: true,
  },
];

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('GenreCarousel', () => {
  beforeEach(() => {
    push.mockClear();
  });
  it('ジャンル選択で onSelect が呼ばれる', () => {
    const onSelect = jest.fn();
    render(
      <GenreCarousel
        genres={genres}
        loading={false}
        error={null}
        selectedGenreId=""
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTestId('genre-carousel-card-programming'));
    expect(onSelect).toHaveBeenCalledWith('programming');
  });

  it('選択済みジャンルを再クリックすると解除される', () => {
    const onSelect = jest.fn();
    render(
      <GenreCarousel
        genres={genres}
        loading={false}
        error={null}
        selectedGenreId="programming"
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByTestId('genre-carousel-card-programming'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('選択中カードに aria-pressed=true が付く', () => {
    render(
      <GenreCarousel
        genres={genres}
        loading={false}
        error={null}
        selectedGenreId="history"
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByTestId('genre-carousel-card-history')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByTestId('genre-carousel-card-programming')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('navigate モードでジャンルクリック時に検索画面へ遷移する', () => {
    render(
      <GenreCarousel
        genres={genres}
        loading={false}
        error={null}
        mode="navigate"
      />
    );

    fireEvent.click(screen.getByTestId('genre-carousel-card-programming'));
    expect(push).toHaveBeenCalledWith('/search?genreId=programming');
  });

  it('navigate モードでは選択ハイライトを付けない', () => {
    render(
      <GenreCarousel
        genres={genres}
        loading={false}
        error={null}
        selectedGenreId="programming"
        mode="navigate"
      />
    );

    expect(screen.getByTestId('genre-carousel-card-programming')).not.toHaveClass('cardSelected');
    expect(screen.getByTestId('genre-carousel-card-programming')).not.toHaveAttribute('aria-pressed');
  });
});
