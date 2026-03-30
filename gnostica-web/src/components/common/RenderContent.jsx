import React from 'react';

// Helper: simple markdown-like renderer
export default function RenderContent({ text }) {
  return (
    <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
      {text.split('\n').map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
        return <p key={i} className={line === '' ? 'mb-3' : 'mb-1'} dangerouslySetInnerHTML={{ __html: boldLine }} />;
      })}
    </div>
  );
}
