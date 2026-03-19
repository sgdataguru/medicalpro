import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revenue & Cost Analysis | MedicalPro',
  description:
    'Analyze hospital revenue drivers and cost center performance',
};

export default function RevenueCostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-[var(--bg-secondary)]">
      {children}
    </section>
  );
}
