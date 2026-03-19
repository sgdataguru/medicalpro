'use client';

interface AnswerRendererProps {
  text: string;
}

export default function AnswerRenderer({ text }: AnswerRendererProps) {
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

  const paragraphs = text.split('\n').filter((line) => line.length > 0);

  return (
    <div className="text-sm text-on-surface-variant leading-relaxed space-y-1.5">
      {paragraphs.slice(0, 4).map((para, i) => (
        <p key={i}>{renderText(para)}</p>
      ))}
      {paragraphs.length > 4 && (
        <p className="text-xs text-on-primary-container italic">
          ... {paragraphs.length - 4} more lines
        </p>
      )}
    </div>
  );
}
