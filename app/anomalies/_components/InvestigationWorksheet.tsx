'use client';

import { useState } from 'react';
import type { InvestigationNote } from '@/lib/anomaly/anomaly.types';
import { formatAnomalyDate } from '@/lib/anomaly/anomaly.utils';

interface InvestigationWorksheetProps {
  anomalyId: string;
  notes: InvestigationNote[];
  onAddNote: (content: string) => void;
}

export default function InvestigationWorksheet({
  anomalyId,
  notes,
  onAddNote,
}: InvestigationWorksheetProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = () => {
    if (newNote.trim().length === 0) return;
    onAddNote(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
      <h3 className="font-headline text-base font-semibold text-secondary-container mb-4">
        Investigation Notes
      </h3>

      {/* Existing notes */}
      {notes.length > 0 && (
        <div className="space-y-3 mb-4">
          {notes.map((note) => (
            <div key={note.id} className="p-3 rounded-lg bg-surface-container-high/30 border border-outline-variant/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-on-surface-variant">
                  {note.authorName}
                </span>
                <span className="text-xs text-on-primary-container">
                  {formatAnomalyDate(note.createdAt)}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* New note input */}
      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add investigation notes..."
          rows={3}
          className="w-full bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 placeholder-on-primary-container focus:ring-2 focus:ring-secondary focus:border-secondary outline-none resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={newNote.trim().length === 0}
            className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
