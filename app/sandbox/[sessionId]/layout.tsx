'use client';

import type { ReactNode } from 'react';
import SandboxContextProvider from '../_components/SandboxContextProvider';
import SandboxBanner from '../_components/SandboxBanner';

interface SessionLayoutProps {
  children: ReactNode;
}

export default function SandboxSessionLayout({ children }: SessionLayoutProps) {
  return (
    <SandboxContextProvider>
      <div className="flex min-h-screen flex-col">
        <SandboxBanner />
        <main className="flex-1">{children}</main>
      </div>
    </SandboxContextProvider>
  );
}
