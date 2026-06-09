import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, List } from 'lucide-react';
import { ListsClient } from './lists-client';
import {
  exploreBackLinkClass,
  listsPageContainerClass,
} from '@/lib/discovery-layout';

export default function ListsPage() {
  return (
    <div className={listsPageContainerClass}>
      <Link href="/" className={exploreBackLinkClass}>
        <ArrowLeft size={16} /> ホームに戻る
      </Link>

      <div className="border-b border-border pb-5">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-foreground">
          <List size={32} />
          リスト
        </h1>
        <p className="mt-2 text-muted-foreground">
          公開リストを探索するか、自分の非公開リストを管理できます。
        </p>
      </div>

      <Suspense fallback={<div data-testid="lists-skeleton">読み込み中...</div>}>
        <ListsClient />
      </Suspense>
    </div>
  );
}
