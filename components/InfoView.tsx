import React, { useState } from 'react';
import README from '../../README.md?raw';
import FUNCTIONAL_MANUAL from '../../FUNCTIONAL_MANUAL.md?raw';
import TECHNICAL_MANUAL from '../../TECHNICAL_MANUAL.md?raw';
import VERSION_LOG from '../../VERSION_LOG.md?raw';

type DocTab = 'Readme' | 'Functional Manual' | 'Technical Manual' | 'Version Log';

const documents: Record<DocTab, string> = {
  'Readme': README,
  'Functional Manual': FUNCTIONAL_MANUAL,
  'Technical Manual': TECHNICAL_MANUAL,
  'Version Log': VERSION_LOG,
};

const InfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('Readme');

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-background overflow-hidden">
      <h1 className="text-2xl font-bold text-text-main mb-4">Application Information</h1>
      <div className="flex border-b border-border-color mb-4">
        {(Object.keys(documents) as DocTab[]).map(tab => (
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
      <div className="flex-1 bg-secondary p-4 rounded-md overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-text-secondary text-sm">
          {documents[activeTab]}
        </pre>
      </div>
    </div>
  );
};

export default InfoView;
