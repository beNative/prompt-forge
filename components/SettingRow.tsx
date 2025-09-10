
import React from 'react';

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
  htmlFor?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children, htmlFor }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border-color last:border-b-0">
      <div className="pr-8">
        <label htmlFor={htmlFor} className="font-medium text-text-main cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
};

export default SettingRow;
