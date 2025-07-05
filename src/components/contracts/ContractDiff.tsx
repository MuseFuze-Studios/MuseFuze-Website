import React from 'react';

interface Props {
  oldText: string;
  newText: string;
}

interface Part { type: 'same' | 'add' | 'remove'; text: string; }

function computeDiff(a: string, b: string): Part[] {
  const oldLines = a.split(/\r?\n/);
  const newLines = b.split(/\r?\n/);
  const len = Math.max(oldLines.length, newLines.length);
  const parts: Part[] = [];
  for (let i = 0; i < len; i++) {
    const oldL = oldLines[i] || '';
    const newL = newLines[i] || '';
    if (oldL === newL) {
      parts.push({ type: 'same', text: oldL });
    } else {
      if (oldL) parts.push({ type: 'remove', text: oldL });
      if (newL) parts.push({ type: 'add', text: newL });
    }
  }
  return parts;
}

const ContractDiff: React.FC<Props> = ({ oldText, newText }) => {
  const parts = computeDiff(oldText, newText);
  return (
    <pre className="whitespace-pre-wrap text-sm">
      {parts.map((p, i) => (
        <div
          key={i}
          className={
            p.type === 'add'
              ? 'bg-green-900/40'
              : p.type === 'remove'
              ? 'bg-red-900/40 line-through'
              : ''
          }
        >
          {p.text}
        </div>
      ))}
    </pre>
  );
};

export default ContractDiff;
