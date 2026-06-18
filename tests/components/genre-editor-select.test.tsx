/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GenreEditorSelect } from '@/components/quiz/genre-editor-select';
import type { GenreMetadata } from '@/types';

const ACTIVE: GenreMetadata[] = [
  {
    id: 'history',
    displayName: '歴史',
    iconImageUrl: null,
    canonicalId: null,
    mergedGenreIds: [],
    isActive: true,
  },
  {
    id: 'programming',
    displayName: 'コンピュータ・IT',
    iconImageUrl: null,
    canonicalId: null,
    mergedGenreIds: [],
    isActive: true,
  },
];

describe('GenreEditorSelect', () => {
  it('loading 時は disabled であること', () => {
    render(
      <GenreEditorSelect
        value=""
        onChange={jest.fn()}
        genres={[]}
        loading
        error={null}
      />
    );
    const input = screen.getByTestId('genre-editor-search-input');
    expect(input).toBeDisabled();
    expect(screen.getByPlaceholderText(/読み込み中/)).toBeInTheDocument();
  });

  it('フォーカスすると全候補がドロップダウンに表示され、選択すると onChange が呼ばれること', () => {
    const onChange = jest.fn();
    render(
      <GenreEditorSelect
        value=""
        onChange={onChange}
        genres={ACTIVE}
        loading={false}
        error={null}
      />
    );
    const input = screen.getByTestId('genre-editor-search-input');
    
    // 最初はドロップダウンがない
    expect(screen.queryByTestId('genre-editor-search-dropdown')).not.toBeInTheDocument();

    // フォーカスする
    fireEvent.focus(input);
    expect(screen.getByTestId('genre-editor-search-dropdown')).toBeInTheDocument();
    expect(screen.getByText('歴史')).toBeInTheDocument();
    expect(screen.getByText('コンピュータ・IT')).toBeInTheDocument();

    // 候補を選択する (MouseDownでフォーカス維持をテストするために MouseDown -> Click)
    const option = screen.getByTestId('genre-editor-search-option-history');
    fireEvent.mouseDown(option);
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith('history');
  });

  it('キーワード入力で候補がフィルタリングされること', () => {
    render(
      <GenreEditorSelect
        value=""
        onChange={jest.fn()}
        genres={ACTIVE}
        loading={false}
        error={null}
      />
    );
    const input = screen.getByTestId('genre-editor-search-input');
    fireEvent.focus(input);

    // '歴史' と入力
    fireEvent.change(input, { target: { value: '歴史' } });

    expect(screen.getByText('歴史')).toBeInTheDocument();
    expect(screen.queryByText('コンピュータ・IT')).not.toBeInTheDocument();
  });

  it('orphan 値は初期値として検索バーに表示され、警告が表示されること', () => {
    render(
      <GenreEditorSelect
        value="legacy-genre"
        onChange={jest.fn()}
        genres={ACTIVE}
        loading={false}
        error={null}
      />
    );
    const input = screen.getByTestId('genre-editor-search-input');
    expect(input).toHaveValue('legacy-genre');
    expect(screen.getByText(/マスタ未登録/)).toBeInTheDocument();
  });

  it('error 時は再試行ボタンとエラーメッセージを表示すること', () => {
    const onRetry = jest.fn();
    render(
      <GenreEditorSelect
        value=""
        onChange={jest.fn()}
        genres={[]}
        loading={false}
        error="取得失敗"
        onRetry={onRetry}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('取得失敗');
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    expect(onRetry).toHaveBeenCalled();
  });
});
