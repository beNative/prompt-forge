
import React, { useState, useEffect, useMemo } from 'react';

// Let TypeScript know that 'marked' is available globally from the script tag in index.html
declare const marked: {
  parse(markdown: string): string;
};

type DocTab = 'Readme' | 'Functional Manual' | 'Technical Manual' | 'Version Log';

const docFiles: Record<DocTab, string> = {
  'Readme': './README.md',
  'Functional Manual': './FUNCTIONAL_MANUAL.md',
  'Technical Manual': './TECHNICAL_MANUAL.md',
  'Version Log': './VERSION_LOG.md',
};

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('Readme');
  const [documents, setDocuments] = useState<Record<DocTab, string>>({
    'Readme': 'Loading...',
    'Functional Manual': 'Loading...',
    'Technical Manual': 'Loading...',
    'Version Log': 'Loading...',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docPromises = (Object.keys(docFiles) as DocTab[]).map(async (tab) => {
          const response = await fetch(docFiles[tab]);
          if (!response.ok) {
            throw new Error(`Failed to load ${docFiles[tab]} (${response.status} ${response.statusText})`);
          }
          const text = await response.text();
          return { tab, text };
        });

        const loadedDocs = await Promise.all(docPromises);

        const newDocumentsState = loadedDocs.reduce((acc, { tab, text }) => {
          acc[tab] = text;
          return acc;
        }, {} as Record<DocTab, string>);
        
        setDocuments(newDocumentsState);

      } catch (err) {
        if (err instanceof Error) {
            console.error("Error fetching documents:", err);
            setError(`Could not load documentation. Please ensure the .md files are accessible. Error: ${err.message}`);
            const errorState = (Object.keys(docFiles) as DocTab[]).reduce((acc, tab) => {
                acc[tab] = `# Error\nFailed to load content for ${tab}.`;
                return acc;
            }, {} as Record<DocTab, string>);
            setDocuments(errorState);
        }
      }
    };

    fetchDocs();
  }, []);

  const renderedHtml = useMemo(() => {
    if (typeof marked === 'undefined' || !documents[activeTab]) {
      return '';
    }
    return marked.parse(documents[activeTab]);
  }, [documents, activeTab]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-background overflow-hidden">
      <h1 className="text-2xl font-bold text-text-main mb-4">Application Information</h1>
      <div className="flex border-b border-border-color mb-4">
        {(Object.keys(docFiles) as DocTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {error && <div className="mb-4 text-red-400 p-3 bg-red-900/50 rounded-md">{error}</div>}
      <div className="flex-1 bg-secondary p-4 rounded-md overflow-y-auto markdown-content text-text-secondary">
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>

      {/* Styles for the rendered markdown content */}
      <style>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
            color: #f9fafb; /* text-main */
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            font-weight: 600;
        }
        .markdown-content h1 {
            font-size: 1.875rem; /* text-3xl */
            border-bottom: 1px solid #374151; /* border-border-color */
            padding-bottom: 0.4em;
        }
        .markdown-content h2 {
            font-size: 1.5rem; /* text-2xl */
        }
        .markdown-content h3 {
            font-size: 1.25rem; /* text-xl */
        }
        .markdown-content p {
            margin-bottom: 1em;
            line-height: 1.65;
        }
        .markdown-content ul, .markdown-content ol {
            list-style-position: inside;
            padding-left: 1.5em;
            margin-bottom: 1em;
        }
        .markdown-content ul {
            list-style-type: disc;
        }
        .markdown-content ol {
            list-style-type: decimal;
        }
        .markdown-content li {
            margin-bottom: 0.5em;
        }
        .markdown-content a {
            color: #6d28d9; /* A nice purple for links */
            text-decoration: underline;
        }
        .markdown-content a:hover {
            color: #8b5cf6;
        }
        .markdown-content code {
            background-color: #111827; /* bg-background */
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        .markdown-content pre {
            background-color: #111827; /* bg-background */
            padding: 1em;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1em;
        }
        .markdown-content pre code {
            padding: 0;
            margin: 0;
            font-size: 100%;
            background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default InfoView;