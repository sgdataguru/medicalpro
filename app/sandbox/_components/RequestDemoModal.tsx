'use client';

import { useState, type FormEvent } from 'react';
import { MODULE_NAV_ITEMS } from '@/lib/sandbox/sandbox.constants';
import { useSandboxContext } from './SandboxContextProvider';
import * as service from '@/lib/sandbox/sandbox.service';

interface RequestDemoModalProps {
  onClose: () => void;
}

export default function RequestDemoModal({ onClose }: RequestDemoModalProps) {
  const { session } = useSandboxContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const featuresExplored = Object.entries(session.features)
        .filter(([, status]) => status !== 'not_visited')
        .map(([key]) => key);

      const result = await service.submitDemoRequest({
        name,
        email,
        hospitalName,
        role,
        interestedModules: selectedModules,
        message: message || undefined,
        sandboxSessionId: session.sessionId,
        featuresExplored,
        simulationsRun: session.simulationsRun,
      });

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-primary-container p-8 text-center shadow-2xl">
          <span className="material-symbols-outlined mb-4 text-[48px] text-green-400">
            check_circle
          </span>
          <h2 className="mb-2 font-headline text-xl font-bold text-white">
            Request Submitted
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            Our team will reach out to you shortly to schedule a personalized demo.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm py-8">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-primary-container p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold text-white">
            Request a Full Demo
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">
                Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">
                Hospital Name *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">
                Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white/60">
              Interested Modules
            </label>
            <div className="flex flex-wrap gap-2">
              {MODULE_NAV_ITEMS.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedModules.includes(mod.id)
                      ? 'border-secondary/50 bg-secondary/20 text-secondary'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {mod.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
