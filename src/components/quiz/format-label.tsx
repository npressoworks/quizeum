'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFormatDescription, getFormatIcon, getFormatLabel } from '@/lib/quiz-format-labels';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormatLabelProps {
  format: string;
  className?: string;
  testId?: string;
}

export function FormatLabel({ format, className, testId }: FormatLabelProps) {
  const label = getFormatLabel(format);
  const icon = getFormatIcon(format);
  const description = getFormatDescription(format);
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const syncPosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const showTooltip = () => {
    syncPosition();
    setOpen(true);
  };

  const hideTooltip = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    syncPosition();
    window.addEventListener('scroll', syncPosition, true);
    window.addEventListener('resize', syncPosition);
    return () => {
      window.removeEventListener('scroll', syncPosition, true);
      window.removeEventListener('resize', syncPosition);
    };
  }, [open, syncPosition]);

  return (
    <>
      <span
        ref={rootRef}
        className="inline-flex"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <Badge
          variant="outline"
          className={cn('cursor-help', className)}
          data-testid={testId}
          tabIndex={0}
          aria-label={`${label}: ${description}`}
        >
          {icon} {label}
        </Badge>
      </span>
      {open &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-50 max-w-xs -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
            style={{ top: position.top - 8, left: position.left }}
          >
            {description}
          </span>,
          document.body
        )}
    </>
  );
}
