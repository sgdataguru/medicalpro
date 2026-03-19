'use client';

import LaunchSandboxButton from './LaunchSandboxButton';
import AccessCodeInput from './AccessCodeInput';

export default function SandboxHeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Logo / Brand */}
      <div className="mb-8 flex items-center gap-3">
        <span className="material-symbols-outlined text-[32px] text-secondary">
          monitoring
        </span>
        <span className="font-headline text-lg font-bold tracking-wide text-white/90">
          SOVEREIGN ANALYST
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-headline text-4xl font-bold text-white sm:text-5xl md:text-6xl max-w-3xl leading-tight">
        Experience the Platform
      </h1>

      {/* Subtext */}
      <p className="mt-5 max-w-xl text-lg text-white/60 leading-relaxed">
        Explore hospital analytics with realistic sample data. Run simulations,
        detect anomalies, and see predictive insights — no commitment required.
      </p>

      {/* Launch CTA */}
      <div className="mt-10">
        <LaunchSandboxButton />
      </div>

      {/* Access Code */}
      <div className="mt-8">
        <AccessCodeInput />
      </div>
    </section>
  );
}
