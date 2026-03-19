'use client';

import { useState } from 'react';
import { shareScenario } from '@/lib/simulation/simulation.service';

interface ShareScenarioDialogProps {
  scenarioId: string;
  scenarioName: string;
  onClose: () => void;
}

export default function ShareScenarioDialog({
  scenarioId,
  scenarioName,
  onClose,
}: ShareScenarioDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareScenario(scenarioId);
      setShareUrl(result.shareUrl);
    } catch {
      // handle error silently for MVP
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-outline-variant/15">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Share Scenario
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scenario name */}
        <p className="mb-4 text-sm text-on-surface-variant">
          Sharing: <span className="font-medium text-on-surface">{scenarioName}</span>
        </p>

        {/* Message textarea */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note for recipients..."
            rows={3}
            className="w-full rounded-lg bg-surface-container p-3 text-sm text-on-surface ring-1 ring-outline-variant/15 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        {/* Share URL display */}
        {shareUrl ? (
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-on-surface-variant">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 truncate rounded-lg bg-surface-container-high px-3 py-2 text-sm text-on-surface ring-1 ring-outline-variant/15"
              />
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              {isSharing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating Link...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  Generate Share Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg border border-outline-variant/30 px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          Close
        </button>
      </div>
    </div>
  );
}
