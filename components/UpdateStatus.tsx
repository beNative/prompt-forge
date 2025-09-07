
import React from 'react';
import type { UpdateStatus } from '../types';
import Spinner from './Spinner';
import { DownloadIcon } from './Icons';

interface UpdateStatusProps {
  status: UpdateStatus;
  version?: string | null;
  error?: string | null;
}

const UpdateStatusDisplay: React.FC<UpdateStatusProps> = ({ status, version, error }) => {
  switch (status) {
    case 'checking':
      return <div className="flex items-center gap-2 text-sm text-text-secondary"><Spinner /> Checking for updates...</div>;
    case 'available':
      return <div className="text-sm text-info">Update to version {version} is available.</div>;
    case 'downloaded':
      return <div className="flex items-center gap-2 text-sm text-success"><DownloadIcon className="w-4 h-4" /> Update to {version} is ready to install.</div>;
    case 'error':
      return <div className="text-sm text-destructive-text" title={error || 'Unknown error'}>Update check failed.</div>;
    case 'idle':
    default:
      return <div className="text-sm text-text-secondary">You are on the latest version.</div>;
  }
};

export default UpdateStatusDisplay;
