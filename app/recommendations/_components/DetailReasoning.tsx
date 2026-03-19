'use client';

import { useMemo } from 'react';

interface DetailReasoningProps {
  reasoning: string;
}

interface ReasoningSection {
  heading: string;
  body: string;
}

function parseReasoning(reasoning: string): ReasoningSection[] {
  const sections: ReasoningSection[] = [];
  const lines = reasoning.split('\n');

  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      // Push any prior section
      if (currentHeading || currentBody.length > 0) {
        sections.push({
          heading: currentHeading,
          body: currentBody.join('\n').trim(),
        });
      }
      currentHeading = headingMatch[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  // Push final section
  if (currentHeading || currentBody.length > 0) {
    sections.push({
      heading: currentHeading,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections;
}

export default function DetailReasoning({ reasoning }: DetailReasoningProps) {
  const sections = useMemo(() => parseReasoning(reasoning), [reasoning]);

  if (!reasoning || reasoning.trim().length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant p-4">
        <p className="text-sm italic text-on-surface-variant">
          No detailed reasoning available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant divide-y divide-outline-variant">
      {sections.map((section, index) => (
        <div key={index} className="px-4 py-3">
          {section.heading && (
            <h3 className="font-headline text-sm font-semibold text-on-surface">
              {section.heading}
            </h3>
          )}
          {section.body && (
            <p
              className={`text-sm leading-relaxed text-on-surface-variant ${
                section.heading ? 'mt-1' : ''
              }`}
            >
              {section.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
