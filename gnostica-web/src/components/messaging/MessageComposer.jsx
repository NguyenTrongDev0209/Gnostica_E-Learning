import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

const MAX_CHARS = 5000;

export default function MessageComposer({ onSendMessage, isPending }) {
  const [content, setContent] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isPending || isComposing) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isOverLimit = content.length > MAX_CHARS;
  const isBlank = !content.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-card border-t border-border/60 flex flex-col gap-2 shrink-0"
    >
      <div className="relative flex items-end gap-2 bg-muted/40 rounded-2xl border border-border/60 p-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Nhập tin nhắn..."
          rows={1}
          maxLength={MAX_CHARS}
          aria-label="Nội dung tin nhắn"
          className="w-full resize-none bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground max-h-32 min-h-[36px] py-1 px-2 scrollbar-hide"
        />

        <button
          type="submit"
          disabled={isBlank || isPending || isOverLimit}
          aria-label="Gửi tin nhắn"
          className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {content.length > MAX_CHARS - 200 && (
        <div className="flex justify-end px-2">
          <span
            className={`text-[10px] font-semibold ${
              isOverLimit ? 'text-error' : 'text-muted-foreground'
            }`}
          >
            {content.length}/{MAX_CHARS}
          </span>
        </div>
      )}
    </form>
  );
}
