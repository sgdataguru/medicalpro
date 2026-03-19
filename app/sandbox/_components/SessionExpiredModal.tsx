'use client';

import { useRouter } from 'next/navigation';

interface SessionExpiredModalProps {
  onClose?: () => void;
}

export default function SessionExpiredModal({ onClose }: SessionExpiredModalProps) {
  const router = useRouter();

  const handleLaunchNew = () => {
    router.push('/sandbox');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-primary-container p-8 text-center shadow-2xl">
        <span className="material-symbols-outlined mb-4 text-[48px] text-red-400">
          timer_off
        </span>
        <h2 className="mb-2 font-headline text-xl font-bold text-white">
          Session Expired
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Your sandbox session has ended. Launch a new sandbox to continue exploring the platform.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              Dismiss
            </button>
          )}
          <button
            onClick={handleLaunchNew}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            <span className="material-symbols-outlined text-[18px]">
              rocket_launch
            </span>
            Launch New Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
