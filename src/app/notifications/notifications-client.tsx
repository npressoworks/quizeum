'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getNotifications, markAsRead, Notification } from '@/services/notification';
import {
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Heart,
  Bell,
  Check,
} from 'lucide-react';
import { NotificationsSkeleton } from '@/components/ui/notifications-skeleton';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function NotificationsClient() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login?redirect=/notifications');
      return;
    }

    const currentUserId = currentUser.id;

    async function loadNotifications() {
      try {
        const list = await getNotifications(currentUserId);
        setNotifications(list);
      } catch (err) {
        console.error('[NotificationsClient] Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [currentUser, authLoading, router]);

  const handleNotificationClick = async (notif: Notification) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      }

      if (notif.type === 'follow' && notif.senderId) {
        router.push(`/profile/${notif.senderId}`);
      } else if (notif.type === 'correction_resolved' && notif.targetId) {
        router.push(`/quiz/${notif.targetId}`);
      } else if (notif.type === 'bookmark' && notif.targetId) {
        router.push(`/quiz/${notif.targetId}`);
      } else if (notif.type === 'quiz_review_warning' && notif.targetId) {
        router.push(`/quiz/${notif.targetId}`);
      }
    } catch (err) {
      console.error('[NotificationsClient] Failed to process notification click:', err);
    }
  };

  const handleAllRead = async () => {
    try {
      const unreadList = notifications.filter(n => !n.isRead);
      await Promise.all(unreadList.map(n => markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('[NotificationsClient] Failed to mark all as read:', err);
    }
  };

  if (authLoading || loading) {
    return <NotificationsSkeleton data-testid="notifications-skeleton" />;
  }

  if (!currentUser) {
    return null;
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={20} className="text-blue-500" />;
      case 'correction_resolved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'bookmark':
        return <Heart size={20} className="text-pink-500" />;
      case 'badge_unlocked':
        return <Bell size={20} className="text-green-500" />;
      case 'quiz_review_warning':
      default:
        return <AlertTriangle size={20} className="text-amber-500" />;
    }
  };

  const getNotificationMessage = (notif: Notification) => {
    switch (notif.type) {
      case 'follow':
        return `${notif.senderName}さんがあなたをフォローしました。`;
      case 'bookmark':
        return `${notif.senderName}さんがあなたのクイズ『${notif.targetTitle || 'クイズ'}』をブックマークしました。`;
      case 'correction_resolved':
        return `${notif.senderName}さんがクイズ『${notif.targetTitle || 'クイズ'}』の指摘を修正しました。`;
      case 'badge_unlocked':
        return `新しいバッジ「${notif.targetTitle || 'バッジ'}」を獲得しました！`;
      case 'quiz_review_warning':
        return `クイズ『${notif.targetTitle || 'クイズ'}』の評価が低下しています。内容の改善を検討してください。`;
      default:
        return '新しい通知があります。';
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <CardContent data-testid="notifications-page-container">
      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleAllRead}>
            <Check size={16} />
            <span>すべて既読にする</span>
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Bell size={40} />
          <p>届いている通知はありません。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                'relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                !notif.isRead && 'border-primary/30 bg-primary/5'
              )}
            >
              <div className="shrink-0">
                {notif.senderAvatar ? (
                  <img
                    src={notif.senderAvatar}
                    alt={notif.senderName || 'Sender'}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notif.type)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{getNotificationMessage(notif)}</p>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {new Date(notif.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {!notif.isRead && (
                <span className="absolute top-4 right-4 size-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  );
}
