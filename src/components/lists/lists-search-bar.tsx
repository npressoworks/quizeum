'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ListsSearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
}

export function ListsSearchBar({ keyword, onKeywordChange }: ListsSearchBarProps) {
  return (
    <div className="relative mb-6">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        className="pl-10"
        placeholder="リストをキーワード検索..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        data-testid="lists-search-input"
      />
    </div>
  );
}
