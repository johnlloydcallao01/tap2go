import React from 'react';

// AdminLayout is now just a simple wrapper since the layout logic
// has been moved to the root layout to preserve sidebar state
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
