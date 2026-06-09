/** Tailwind class map replacing edit.module.css for list editor components. */
export const listEditorClasses = {
  container: 'mx-auto max-w-[1100px] px-5 py-10',
  title: 'mb-2 inline-block text-4xl font-extrabold tracking-tight text-foreground',
  subtitle: 'mb-10 text-muted-foreground',
  grid: 'grid grid-cols-1 gap-8 lg:grid-cols-2',
  card: 'h-fit rounded-xl border border-border bg-card p-6 shadow-sm md:p-8',
  cardTitle:
    'mb-6 flex items-center gap-2.5 border-b border-border pb-3 text-xl font-bold',
  formGroup: 'mb-5 flex flex-col gap-2',
  label: 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
  input:
    'w-full rounded-md border border-input bg-background px-4 py-3.5 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  textarea:
    'min-h-[100px] w-full resize-y rounded-md border border-input bg-background px-4 py-3.5 text-base text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  toggleRow:
    'mb-6 flex items-center justify-between rounded-md border border-border bg-muted/30 p-4',
  searchBar: 'mb-5 flex gap-2.5',
  searchList: 'flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1.5',
  searchItem:
    'flex items-center justify-between rounded-sm border border-border bg-muted/20 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/40',
  searchItemInfo: 'flex max-w-[75%] flex-col gap-1',
  searchItemTitle:
    'truncate text-sm font-semibold text-foreground',
  searchItemMeta: 'text-xs text-muted-foreground',
  attachBtn:
    'cursor-pointer rounded border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground',
  attachedList:
    'flex min-h-[200px] flex-col gap-3 rounded-md border-2 border-dashed border-border bg-muted/20 p-4',
  attachedItem:
    'flex cursor-grab items-center justify-between rounded-sm border border-border bg-card px-4 py-3 transition-shadow active:cursor-grabbing',
  attachedItemDragging: 'border-primary bg-primary/5 opacity-50',
  attachedItemLeft: 'flex max-w-[80%] items-center gap-3',
  dragHandle: 'flex cursor-grab items-center text-muted-foreground',
  attachedItemTitle: 'truncate text-sm font-semibold text-foreground',
  detachBtn:
    'cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
  actionsBar:
    'col-span-full mt-10 flex justify-end gap-4 border-t border-border pt-6',
  coverUpload:
    'cursor-pointer rounded-md border-2 border-dashed border-border p-5 text-center transition-colors hover:border-primary hover:bg-muted/30',
  coverPreview: 'max-h-[120px] w-full rounded-sm object-cover',
  emptyListState:
    'flex w-full flex-col items-center justify-center gap-2.5 p-10 text-center text-sm text-muted-foreground',
} as const;
