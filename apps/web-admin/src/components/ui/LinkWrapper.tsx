/**
 * Link Wrapper Component
 * 
 * Wraps Next.js Link to fix React 19 JSX compatibility issues
 */

import React from 'react';
import NextLink from 'next/link';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  title?: string;
  // Next.js route prefetch (hover/viewport). Passed through to NextLink via
  // ...props at runtime; declared here so callers typecheck. See §15 item 3.
  prefetch?: boolean | 'auto' | null;
}

const Link = ({ href, children, className, target, rel, onClick, title, prefetch, ...props }: LinkProps) => {
  return React.createElement(
    NextLink,
    {
      href,
      className,
      target,
      rel,
      onClick,
      title,
      prefetch: prefetch ?? undefined,
      ...props,
    },
    children
  );
};

Link.displayName = 'Link';

export default Link;
