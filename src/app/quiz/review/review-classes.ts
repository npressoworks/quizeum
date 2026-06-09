/** Tailwind class map replacing review.module.css */
export const reviewClasses = {
  container: 'mx-auto flex max-w-[900px] flex-col gap-6 px-5 py-10',
  backBtn:
    'inline-flex items-center gap-2 self-start font-medium text-muted-foreground transition-colors hover:text-foreground',
  setupPanel:
    'flex flex-col gap-6 rounded-xl border border-border bg-card p-8',
  panelTitle: 'text-2xl font-bold text-foreground',
  panelDesc: 'text-sm leading-relaxed text-muted-foreground',
  genreSelector: 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4',
  genreCard:
    'flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50',
  genreSelected: 'border-primary bg-primary/5',
  genreIcon: 'text-2xl',
  genreLabel: 'text-sm font-medium text-foreground',
  startBtn: '',
  completedCard:
    'flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center',
  completedTitle: 'text-2xl font-bold text-foreground',
  completedDesc: 'text-sm leading-relaxed text-muted-foreground',
} as const;
