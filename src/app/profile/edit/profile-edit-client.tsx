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
import { ErrorOutlined, SaveOutlined, ArrowBackOutlined } from '@mui/icons-material';
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
import { useActiveGenres } from '@/hooks/useActiveGenres';

export function ProfileEditClient() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [youtube, setYoutube] = useState('');
  const [x, setX] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProfileValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');

  const { genres, loading: genresLoading } = useActiveGenres();

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

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
          setSelectedGenres(userData.followedGenres || []);
          if (userData.snsLinks) {
            setYoutube(userData.snsLinks.youtube || '');
            setX(userData.snsLinks.x || '');
            setInstagram(userData.snsLinks.instagram || '');
            setTiktok(userData.snsLinks.tiktok || '');
          }
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
    const validationErrors = validateProfileData({
      displayName,
      bio,
      snsLinks: { youtube, x, instagram, tiktok }
    });
    setErrors(validationErrors);
  }, [displayName, bio, youtube, x, instagram, tiktok, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || errors.length > 0 || submitting) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await updateProfile(currentUser.id, {
        displayName,
        bio,
        followedGenres: selectedGenres,
        snsLinks: { youtube, x, instagram, tiktok }
      });
      router.push(`/profile/${currentUser.id}`);
    } catch (err: unknown) {
      console.error('Profile update failed:', err);
      setSubmitError((err as Error)?.message || '更新に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field: 'displayName' | 'bio' | 'snsLinks.youtube' | 'snsLinks.x' | 'snsLinks.instagram' | 'snsLinks.tiktok') => {
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
        <ArrowBackOutlined sx={{ fontSize: 16 }} />
        <span>プロフィールに戻る</span>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>プロフィールの編集</CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <ErrorOutlined sx={{ fontSize: 16 }} className="size-4" />
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

            {/* 好きなジャンル選択 */}
            <div className="flex flex-col gap-2" data-testid="profile-genre-select">
              <Label>好きなジャンル</Label>
              {genresLoading ? (
                <span className="text-sm text-muted-foreground">ジャンル一覧を読み込み中...</span>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.map(genre => {
                    const isSelected = selectedGenres.includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => handleGenreToggle(genre.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground hover:bg-accent border-input"
                        )}
                        disabled={submitting}
                      >
                        {genre.iconImageUrl && (
                          <img src={genre.iconImageUrl} alt="" className="size-4 object-contain" />
                        )}
                        <span>{genre.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SNS Links */}
            <div className="flex flex-col gap-4 border-t pt-4">
              <h3 className="text-sm font-semibold">SNSリンクの登録</h3>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className={cn(getFieldError('snsLinks.youtube') && 'border-destructive')}
                  placeholder="https://www.youtube.com/channel/..."
                  disabled={submitting}
                />
                {getFieldError('snsLinks.youtube') && (
                  <span className="text-xs text-destructive">{getFieldError('snsLinks.youtube')}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="x">X (旧 Twitter)</Label>
                <Input
                  id="x"
                  type="text"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className={cn(getFieldError('snsLinks.x') && 'border-destructive')}
                  placeholder="https://x.com/..."
                  disabled={submitting}
                />
                {getFieldError('snsLinks.x') && (
                  <span className="text-xs text-destructive">{getFieldError('snsLinks.x')}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className={cn(getFieldError('snsLinks.instagram') && 'border-destructive')}
                  placeholder="https://www.instagram.com/..."
                  disabled={submitting}
                />
                {getFieldError('snsLinks.instagram') && (
                  <span className="text-xs text-destructive">{getFieldError('snsLinks.instagram')}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className={cn(getFieldError('snsLinks.tiktok') && 'border-destructive')}
                  placeholder="https://www.tiktok.com/@..."
                  disabled={submitting}
                />
                {getFieldError('snsLinks.tiktok') && (
                  <span className="text-xs text-destructive">{getFieldError('snsLinks.tiktok')}</span>
                )}
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
                <SaveOutlined sx={{ fontSize: 18 }} />
                <span>{submitting ? '保存中...' : '保存'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
