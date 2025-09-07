
import React from 'react';
const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />
);
export const PlusIcon = (p: any) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></Icon>;
export const GearIcon = (p: any) => <Icon {...p}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></Icon>;
export const FileIcon = (p: any) => <Icon {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></Icon>;
export const InfoIcon = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></Icon>;
export const FileCodeIcon = (p: any) => <Icon {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 17 2-2-2-2"></path></Icon>;
export const CommandIcon = (p: any) => <Icon {...p}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></Icon>;
export const FolderPlusIcon = (p: any) => <Icon {...p}><path d="M12 10v6"></path><path d="M9 13h6"></path><path d="M20 12.58V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h.58"></path><path d="M18 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path></Icon>;
export const SearchIcon = (p: any) => <Icon {...p}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></Icon>;
export const SparklesIcon = (p: any) => <Icon {...p}><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"></path><path d="M3 3L4 5"></path><path d="M20 20L21 21"></path><path d="M3 21L4 19"></path><path d="M20 3L21 4"></path><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"></path></Icon>;
export const TrashIcon = (p: any) => <Icon {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;
export const UndoIcon = (p: any) => <Icon {...p}><path d="M21 13v-2a4 4 0 0 0-4-4H8L12 3"></path><path d="M3 13h6a4 4 0 0 0 4 4v2"></path></Icon>;
export const RedoIcon = (p: any) => <Icon {...p}><path d="M3 13v-2a4 4 0 0 1 4-4h11l-4-4"></path><path d="M21 13h-6a4 4 0 0 1-4 4v2"></path></Icon>;
export const CopyIcon = (p: any) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></Icon>;
export const CheckIcon = (p: any) => <Icon {...p}><polyline points="20 6 9 17 4 12"></polyline></Icon>;
export const SunIcon = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></Icon>;
export const MoonIcon = (p: any) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></Icon>;
export const DownloadIcon = (p: any) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></Icon>;
export const ChevronDownIcon = (p: any) => <Icon {...p}><polyline points="6 9 12 15 18 9"></polyline></Icon>;
export const ChevronRightIcon = (p: any) => <Icon {...p}><polyline points="9 18 15 12 9 6"></polyline></Icon>;
export const FolderIcon = (p: any) => <Icon {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></Icon>;
export const FolderOpenIcon = (p: any) => <Icon {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><path d="M15 11l-3 6-3-6h6z"></path></Icon>;
export const XIcon = (p: any) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
// Placeholders for settings view
export const FeatherIconPlaceholder = (p: any) => <Icon {...p}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></Icon>;
export const TablerIconPlaceholder = (p: any) => <Icon {...p}><path d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z"></path></Icon>;
export const MaterialIconPlaceholder = (p: any) => <Icon {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0"></path></Icon>;
