'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { useAnalytics } from '@/lib/analytics/use-analytics';

type CtaLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** Stable label identifying where on the page this CTA lives. */
  location: string;
  children: ReactNode;
};

/**
 * A drop-in replacement for next/link that records a `cta_clicked` event.
 * Use for primary conversion buttons so the admin panel can see which CTAs
 * actually drive clicks.
 */
export function CtaLink({ href, location, children, onClick, ...rest }: CtaLinkProps) {
  const { track } = useAnalytics();

  return (
    <Link
      href={href}
      onClick={(e) => {
        track({ event: 'cta_clicked', properties: { location, href } });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
