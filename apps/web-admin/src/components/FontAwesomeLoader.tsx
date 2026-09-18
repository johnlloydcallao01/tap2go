'use client';

import { useEffect } from 'react';

const HREF = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
const INTEGRITY =
  'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';

/**
 * Loads the legacy Font-Awesome stylesheet without render-blocking first
 * paint. Injected on mount (never part of SSR HTML), so slow CDN never
 * delays content. Icons simply appear when the sheet arrives.
 */
export function FontAwesomeLoader() {
  useEffect(() => {
    if (document.querySelector(`link[data-fa="cdn"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    link.integrity = INTEGRITY;
    link.crossOrigin = 'anonymous';
    link.referrerPolicy = 'no-referrer';
    link.dataset.fa = 'cdn';
    document.head.appendChild(link);
  }, []);
  return null;
}
