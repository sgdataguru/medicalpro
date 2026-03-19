'use client';

interface StreamingAnswerTextProps {
  text: string;
  isStreaming: boolean;
}

export default function StreamingAnswerText({ text, isStreaming }: StreamingAnswerTextProps) {
  // Simple markdown bold rendering
  const renderText = (raw: string) => {
    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-on-surface">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Split by newlines and render paragraphs
  const paragraphs = text.split('\n').filter((line) => line.length > 0);

  return (
    <div className="text-sm text-on-surface-variant leading-relaxed space-y-2">
      {paragraphs.map((para, i) => {
        // Numbered list items
        if (/^\d+\.\s/.test(para)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-secondary font-bold shrink-0">
                {para.match(/^\d+/)?.[0]}.
              </span>
              <span>{renderText(para.replace(/^\d+\.\s/, ''))}</span>
            </div>
          );
        }
        // Bullet items
        if (para.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-secondary">•</span>
              <span>{renderText(para.slice(2))}</span>
            </div>
          );
        }
        return <p key={i}>{renderText(para)}</p>;
      })}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-secondary animate-pulse rounded-sm ml-0.5" />
      )}
    </div>
  );
}
