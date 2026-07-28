import React from 'react';

// Helper: simple markdown-like renderer or direct HTML renderer
export default function RenderContent({ text }) {
  if (!text) return null;

  // Check if content is HTML (from Quill Editor)
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return (
      <div 
        className="text-foreground text-sm sm:text-base leading-relaxed quill-content html-content break-words [word-break:break-word] [overflow-wrap:anywhere] max-w-full overflow-hidden [&_*]:max-w-full [&_p]:break-words [&_p]:[word-break:break-word] [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_a]:break-all" 
        dangerouslySetInnerHTML={{ __html: text }} 
      />
    );
  }

  return (
    <div className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere] max-w-full overflow-hidden">
      {text.split('\n').map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
        return <p key={i} className={line === '' ? 'mb-3 break-words [word-break:break-word]' : 'mb-1 break-words [word-break:break-word]'} dangerouslySetInnerHTML={{ __html: boldLine }} />;
      })}
    </div>
  );
}
