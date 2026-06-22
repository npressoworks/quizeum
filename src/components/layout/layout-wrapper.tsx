'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BottomNav } from './bottom-nav';
import { cn } from '@/lib/utils';

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isPlayPage = pathname ? pathname.includes('/play') : false;

  if (isPlayPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen max-w-[100vw] overflow-x-hidden bg-background md:pl-[70px] max-md:pb-[60px]",
        isCollapsed ? "lg:pl-[70px]" : "lg:pl-[275px]"
      )}
    >
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex min-w-0 flex-1 flex-col max-w-[100vw] overflow-x-hidden">
        <Header />
        <main className="mx-auto w-full max-w-[1200px] flex-1 p-6 max-md:p-4">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
};

export default LayoutWrapper;
