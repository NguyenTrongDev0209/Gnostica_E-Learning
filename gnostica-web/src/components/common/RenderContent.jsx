import React from 'react';

// Helper: simple markdown-like renderer or direct HTML renderer
export default function RenderContent({ text }) {
  if (!text) return null;

  // Check if content is HTML (from Quill Editor)
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return (
      <div 
        className="text-foreground text-sm sm:text-base leading-relaxed quill-content html-content break-words overflow-wrap-anywhere [&_*]:max-w-full [&_pre]:whitespace-pre-wrap [&_a]:break-all" 
        dangerouslySetInnerHTML={{ __html: text }} 
      />
    );
  }

  return (
    <div className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
      {text.split('\n').map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
        return <p key={i} className={line === '' ? 'mb-3' : 'mb-1'} dangerouslySetInnerHTML={{ __html: boldLine }} />;
      })}
    </div>
  );
}
