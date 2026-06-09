'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionStatusBadgeProps {
  visible: boolean;
}

export function SubscriptionStatusBadge({ visible }: SubscriptionStatusBadgeProps) {
  if (!visible) return null;

  return (
    <Badge variant="secondary" className="gap-1" data-testid="subscription-status-badge">
      <Crown size={14} />
      Pro 契約中
    </Badge>
  );
}
