import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supply Chain Optimizer | MedicalPro',
  description:
    'Optimize hospital supply chain with demand forecasting and procurement recommendations',
};

export default function SupplyChainLayout({
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
