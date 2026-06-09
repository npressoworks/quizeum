/** Tailwind class map replacing quick-press-question-text.module.css */
export const quickPressClasses = {
  root: 'w-full max-w-full overflow-wrap-anywhere text-[1.85rem] leading-snug font-normal text-foreground',
  rootReserved: 'relative',
  reserveLayer: 'pointer-events-none block w-full select-none',
  displayLayer: 'absolute top-0 right-0 left-0',
  inlineLayer: 'block w-full',
  char: 'inline-block bg-clip-text text-transparent',
  charAnimated: 'animate-[quick-press-wipe-in_var(--quick-press-wipe-ms,250ms)_linear_forwards]',
  charReserved: 'animate-none bg-none text-transparent',
  charBold: 'text-[1.15em] font-extrabold',
} as const;
