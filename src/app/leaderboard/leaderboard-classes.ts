/** Tailwind class map replacing leaderboard.module.css */
export const leaderboardClasses = {
  container: 'mx-auto flex max-w-[900px] flex-col gap-8 px-5 py-10',
  titleSection: 'text-center',
  title: 'text-3xl font-extrabold text-foreground',
  tabBar: 'flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-1',
  tab: 'flex-1 cursor-pointer rounded-md px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
  tabActive: 'relative bg-background text-foreground shadow-sm',
  boardCard: 'overflow-hidden rounded-xl border border-border bg-card',
  table: 'w-full border-collapse text-sm',
  th: 'border-b border-border bg-muted/30 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground',
  td: 'border-b border-border px-4 py-3 text-foreground',
  rankBadge:
    'inline-flex size-8 items-center justify-center rounded-full text-sm font-bold',
  rank1: 'bg-amber-400 text-amber-950 shadow-sm',
  rank2: 'bg-slate-300 text-slate-900',
  rank3: 'bg-amber-700 text-white',
  rankNormal: 'border border-border text-muted-foreground',
  avatar: 'mr-3 inline-block rounded-full border border-border object-cover',
} as const;
