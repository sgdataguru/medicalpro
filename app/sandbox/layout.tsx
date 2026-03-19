import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sandbox Demo | Farrer Park Hospital',
  description:
    'Explore hospital analytics with realistic synthetic data. No commitment required.',
};

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-primary-container">
      {children}
    </div>
  );
}
