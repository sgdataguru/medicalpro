'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as service from '@/lib/sandbox/sandbox.service';

export default function AccessCodeInput() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async () => {
    if (code.length !== 8) {
      setError('Access code must be 8 characters.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await service.validateAccessCode(code);
      if (result.valid && result.sessionId) {
        router.push(`/sandbox/${result.sessionId}`);
      } else {
        setError(result.error ?? 'Invalid access code.');
      }
    } catch {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        Or enter your access code
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, 8));
            setError(null);
          }}
          placeholder="XXXXXXXX"
          maxLength={8}
          className="w-40 rounded-lg bg-white/5 px-4 py-2.5 text-center text-sm font-mono text-white tracking-widest ring-1 ring-white/10 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
        />
        <button
          onClick={handleSubmit}
          disabled={isValidating || code.length < 8}
          className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Go'
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
