// Module declarations for better TypeScript resolution in Vercel builds
declare module '@/types/components' {
  import React from 'react';

  export type IconComponent = React.ComponentType<{
    className?: string;
  }>;

  export type NavigationItem = {
    name: string;
    href: string;
    icon: IconComponent;
  };

  export type NavigationCategory = {
    name: string;
    icon: IconComponent;
    items: NavigationItem[];
  };

  export const asIconComponent: (icon: any) => IconComponent;

  const _default: {
    asIconComponent: typeof asIconComponent;
  };
  export default _default;
}

// Additional module declarations for other potential path mapping issues
declare module '@/types/*' {
  const content: any;
  export default content;
}

declare module '@/*' {
  const content: any;
  export default content;
}
