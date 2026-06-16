'use client';

import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import styles from './ai-chat-assistant.module.css';

interface AiChatAssistantButtonProps {
  isProUser: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export function AiChatAssistantButton({
  isProUser,
  isChatOpen,
  setIsChatOpen,
}: AiChatAssistantButtonProps) {
  if (!isProUser) return null;

  return (
    <button
      data-testid="ai-chat-assistant-button"
      className={`${styles.floatingButton} ${isChatOpen ? styles.floatingButtonOpen : ''}`}
      onClick={() => setIsChatOpen(!isChatOpen)}
      aria-label="AIアシスタントを開く"
    >
      {isChatOpen ? (
        <Sparkles size={24} className={styles.headerIcon} />
      ) : (
        <MessageSquare size={24} />
      )}
    </button>
  );
}
