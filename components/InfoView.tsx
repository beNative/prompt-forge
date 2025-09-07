
import React, { useState, useEffect, useMemo } from 'react';
import Button from './Button';

// Let TypeScript know that 'marked' is available globally from the script tag in index.html
declare const marked: {
  parse(markdown: string): string;
};

type DocTab = 'Readme' | 'Functional Manual' | 'Technical Manual' | 'Version Log';

const docFiles: Record<DocTab, string> = {
  'Readme': 'README.md',
  'Functional Manual': 'FUNCTIONAL_MANUAL.md',
  'Technical Manual': 'TECHNICAL_MANUAL.md',
  'Version Log': 'VERSION_LOG.md',
};

interface InfoViewProps {
  onOpenAboutModal: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ onOpenAboutModal }) => {
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
      const isElectron = !!window.electronAPI;
      try {
        const docPromises = (Object.keys(docFiles) as DocTab[]).map(async (tab) => {
          const filename = docFiles[tab];
          let text = '';

          if (isElectron) {
            const result = await window.electronAPI!.readDoc(filename);
            if (result.success && result.content) {
              text = result.content;
            } else {
              throw new Error(result.error || `Failed to load ${filename} from main process.`);
            }
          } else {
            const response = await fetch(`./${filename}`);
            if (!response.ok) {
              throw new Error(`Failed to load ${filename} (${response.status} ${response.statusText})`);
            }
            text = await response.text();
          }
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
            setError(`Could not load documentation. Error: ${err.message}`);
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
    <div className="flex-1 flex flex-col p-6 bg-background overflow-hidden h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-text-main">Application Information</h1>
        <Button onClick={onOpenAboutModal} variant="secondary">
            About PromptForge
        </Button>
      </div>
      <div className="flex border-b border-border-color mb-4">
        {(Object.keys(docFiles) as DocTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-main'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {error && <div className="mb-4 text-destructive-text p-3 bg-destructive-bg rounded-md">{error}</div>}
      <div className="flex-1 bg-secondary p-6 rounded-md overflow-y-auto markdown-content text-text-secondary">
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>
      <footer className="text-center text-xs text-text-secondary pt-4 flex-shrink-0">
        © 2025 Tim Sinaeve
      </footer>

      <style>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
            color: rgb(var(--color-text-main));
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            font-weight: 600;
        }
        .markdown-content h1 {
            font-size: 1.875rem; /* text-3xl */
            border-bottom: 1px solid rgb(var(--color-border));
            padding-bottom: 0.4em;
            color: rgb(var(--color-text-main));
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
            padding-left: 1.5em;
            margin-bottom: 1em;
        }
        .markdown-content li {
            margin-bottom: 0.5em;
        }
        .markdown-content a {
            color: rgb(var(--color-accent));
            text-decoration: underline;
        }
        .markdown-content a:hover {
            opacity: 0.8;
        }
        .markdown-content code {
            background-color: rgb(var(--color-background));
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            border-radius: 6px;
            font-family: 'JetBrains Mono', monospace;
            color: rgb(var(--color-accent));
            border: 1px solid rgb(var(--color-border));
        }
        .markdown-content pre {
            background-color: rgb(var(--color-background));
            padding: 1em;
            border: 1px solid rgb(var(--color-border));
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1em;
        }
        .markdown-content pre code {
            padding: 0;
            margin: 0;
            font-size: 100%;
            background-color: transparent;
            border: none;
        }
      `}</style>
    </div>
  );
};

export default InfoView;