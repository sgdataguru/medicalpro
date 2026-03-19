'use client';

interface NLQueryInterfaceProps {
  turnCount: number;
  isConversationActive: boolean;
  onNewConversation: () => void;
}

export default function NLQueryInterface({
  turnCount,
  isConversationActive,
  onNewConversation,
}: NLQueryInterfaceProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-secondary">question_answer</span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Analytics Query
          </h1>
          {isConversationActive && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary rounded-full">
              {turnCount} turn{turnCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">
          Ask questions about your hospital data in plain English.
        </p>
      </div>
      {isConversationActive && (
        <button
          onClick={onNewConversation}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Query
        </button>
      )}
    </div>
  );
}
