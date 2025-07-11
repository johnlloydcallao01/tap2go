// React 19 compatibility fixes
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Global type fixes for React 19
declare global {
  namespace React {
    type ReactNode = import('react').ReactNode;
  }
}

export {};
