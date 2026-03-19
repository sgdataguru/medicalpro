import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foresight Simulations | Farrer Park Hospital',
  description: 'Run what-if simulations to model cascading impacts across hospital modules.',
};

export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
