import React, { useMemo, useRef } from 'react';

// Let TypeScript know Prism is available on the window
declare const Prism: any;

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, readOnly = false }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const highlightedContent = useMemo(() => {
    if (typeof Prism === 'undefined' || !Prism.languages.json) {
      // Fallback for when Prism isn't loaded yet
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    // Append a newline to prevent issues with highlighting the last line
    try {
      // Make sure it's valid JSON before highlighting for better results.
      // If not, just highlight as plain text which shows errors better.
      JSON.parse(value);
      return Prism.highlight(value + '\n', Prism.languages.json, 'json');
    } catch (e) {
      return Prism.highlight(value + '\n', Prism.languages.clike, 'clike');
    }
  }, [value]);

  const syncScroll = () => {
    if (editorRef.current && preRef.current) {
      preRef.current.scrollTop = editorRef.current.scrollTop;
      preRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  return (
    <div 
      className="editor-container relative w-full rounded-lg bg-background border border-border-color focus-within:ring-2 focus-within:ring-primary focus-within:border-primary h-96"
    >
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck="false"
        readOnly={readOnly}
        className="absolute inset-0 p-4 w-full h-full bg-transparent text-transparent caret-primary resize-none font-mono text-sm focus:outline-none z-10 whitespace-pre-wrap break-words"
      />
      <pre 
        ref={preRef}
        aria-hidden="true" 
        className="absolute inset-0 p-4 w-full h-full overflow-auto pointer-events-none font-mono text-sm whitespace-pre-wrap break-words"
      >
        <code className="language-json" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
      </pre>
    </div>
  );
};

export default JsonEditor;
