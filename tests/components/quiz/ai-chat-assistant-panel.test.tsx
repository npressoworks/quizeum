/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiChatAssistantPanel } from '@/components/quiz/editor/ai-chat-assistant-panel';
import { AiChatAssistantButton } from '@/components/quiz/editor/ai-chat-assistant-button';

describe('AiChatAssistantButton', () => {
  it('Pro ユーザーでない場合は表示されない', () => {
    const { container } = render(
      <AiChatAssistantButton isProUser={false} isChatOpen={false} setIsChatOpen={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('Pro ユーザーの場合は表示され、クリックで開閉関数を呼ぶ', () => {
    const setIsChatOpen = jest.fn();
    render(
      <AiChatAssistantButton isProUser={true} isChatOpen={false} setIsChatOpen={setIsChatOpen} />
    );

    const button = screen.getByTestId('ai-chat-assistant-button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(setIsChatOpen).toHaveBeenCalledWith(true);
  });
});

describe('AiChatAssistantPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    messages: [
      { id: '1', role: 'assistant' as const, content: 'こんにちは' },
      { id: '2', role: 'user' as const, content: '作問をお願いします' },
    ],
    input: '',
    isGenerating: false,
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    chatLimitUsage: { limit: 100, usedToday: 10, remainingToday: 90 },
  };

  it('非表示の時はレンダリングされない', () => {
    const { container } = render(
      <AiChatAssistantPanel {...defaultProps} isOpen={false} />
    );
    // スライドアウトして非表示にするために DOM 上に存在しつつ visibility や opacity が反映されるか、
    // あるいは単純にマウントされないかのいずれか。
    // 設計書に従い、isOpen === false の場合は表示されない、または data-open="false" 属性となるように検証。
    const panel = container.querySelector('[data-testid="ai-chat-assistant-panel"]');
    if (panel) {
      expect(panel).toHaveAttribute('data-open', 'false');
    }
  });

  it('メッセージ履歴と入力フォームが正しく表示される', () => {
    render(<AiChatAssistantPanel {...defaultProps} />);
    
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('作問をお願いします')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AIに指示を送る...')).toBeInTheDocument();
    expect(screen.getByText('10/100回使用中')).toBeInTheDocument(); // 利用制限の表記
  });

  it('閉じるボタンのクリックで onClose を呼ぶ', () => {
    const onClose = jest.fn();
    render(<AiChatAssistantPanel {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByTestId('ai-chat-close-button');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
