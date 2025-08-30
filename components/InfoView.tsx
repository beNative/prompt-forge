import React, { useState, useEffect } from 'react';

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
                acc[tab] = `Failed to load content for ${tab}.`;
                return acc;
            }, {} as Record<DocTab, string>);
            setDocuments(errorState);
        }
      }
    };

    fetchDocs();
  }, []);

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
      <div className="flex-1 bg-secondary p-4 rounded-md overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-text-secondary text-sm">
          {documents[activeTab]}
        </pre>
      </div>
    </div>
  );
};

export default InfoView;
