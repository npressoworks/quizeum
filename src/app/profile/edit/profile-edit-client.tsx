'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  getUser,
  updateProfile,
  validateProfileData,
  ProfileValidationError
} from '@/services/user';
import { AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { ProfileEditSkeleton } from '@/components/profile/profile-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ProfileEditClient() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProfileValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadUserData() {
      if (authLoading) return;
      if (!currentUser) {
        router.push('/login');
        return;
      }
      try {
        const userData = await getUser(currentUser.id);
        if (userData) {
          setDisplayName(userData.displayName || '');
          setBio(userData.bio || '');
        }
      } catch (err) {
        console.error('Failed to load user profile for editing:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (loading) return;
    const validationErrors = validateProfileData({ displayName, bio });
    setErrors(validationErrors);
  }, [displayName, bio, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || errors.length > 0 || submitting) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await updateProfile(currentUser.id, { displayName, bio });
      router.push(`/profile/${currentUser.id}`);
    } catch (err: unknown) {
      console.error('Profile update failed:', err);
      setSubmitError((err as Error)?.message || '更新に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field: 'displayName' | 'bio') => {
    return errors.find(err => err.field === field)?.message;
  };

  if (authLoading || loading) {
    return <ProfileEditSkeleton />;
  }

  const hasErrors = errors.length > 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <Button
        type="button"
        variant="ghost"
        className="mb-4 -ml-2"
        onClick={() => router.push(`/profile/${currentUser?.id}`)}
      >
        <ArrowLeft size={16} />
        <span>プロフィールに戻る</span>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>プロフィールの編集</CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={cn(getFieldError('displayName') && 'border-destructive')}
                placeholder="ユーザー名を入力してください"
                disabled={submitting}
              />
              <div className="flex items-center justify-between text-xs">
                {getFieldError('displayName') ? (
                  <span className="text-destructive">{getFieldError('displayName')}</span>
                ) : (
                  <span />
                )}
                <span className={cn('text-muted-foreground', displayName.length > 30 && 'text-destructive')}>
                  {displayName.length} / 30
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={cn('min-h-[120px]', getFieldError('bio') && 'border-destructive')}
                placeholder="自己紹介を書いてみましょう（好きなジャンルや関心など）"
                disabled={submitting}
                rows={5}
              />
              <div className="flex items-center justify-between text-xs">
                {getFieldError('bio') ? (
                  <span className="text-destructive">{getFieldError('bio')}</span>
                ) : (
                  <span />
                )}
                <span className={cn('text-muted-foreground', bio.length > 200 && 'text-destructive')}>
                  {bio.length} / 200
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/profile/${currentUser?.id}`)}
                disabled={submitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={hasErrors || submitting}>
                <Save size={18} />
                <span>{submitting ? '保存中...' : '保存'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
