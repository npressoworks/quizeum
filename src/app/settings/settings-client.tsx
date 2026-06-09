'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SettingsClient() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6" data-testid="settings-page-container">
      <Card>
        <CardHeader>
          <CardTitle>表示テーマ</CardTitle>
          <CardDescription>アプリ全体の配色を切り替えます。</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>アカウント</CardTitle>
            <CardDescription>プロフィール情報を編集できます。</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profile/edit"
              data-testid="settings-profile-edit-link"
              className={cn(buttonVariants({ variant: 'secondary' }))}
            >
              プロフィールを編集
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
