'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSandboxProvisioning } from '../_hooks/useSandboxProvisioning';
import SandboxProvisioningLoader from './SandboxProvisioningLoader';

export default function LaunchSandboxButton() {
  const router = useRouter();
  const { provision, status, progress } = useSandboxProvisioning();
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleLaunch = async () => {
    setIsProvisioning(true);
    const result = await provision();
    if (result) {
      router.push(`/sandbox/${result.sessionId}`);
    } else {
      setIsProvisioning(false);
    }
  };

  if (isProvisioning && status !== 'idle' && status !== 'error') {
    return <SandboxProvisioningLoader status={status} progress={progress} />;
  }

  return (
    <button
      onClick={handleLaunch}
      className="inline-flex items-center gap-3 rounded-xl bg-secondary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
      Launch Sandbox Demo
    </button>
  );
}
