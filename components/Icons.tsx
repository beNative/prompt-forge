
import React from 'react';
import { useIconSet } from '../hooks/useIconSet';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';

const iconSets = {
  heroicons: HeroIcons,
  lucide: LucideIcons,
};

type IconComponents = typeof HeroIcons & typeof LucideIcons;

const createIconComponent = (name: keyof IconComponents) => {
  const IconComponent: React.FC<React.SVGProps<SVGSVGElement> & { className?: string }> = (props) => {
    const { iconSet } = useIconSet();
    const Icons = iconSets[iconSet] || iconSets.heroicons;
    const SpecificIcon = Icons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
    if (!SpecificIcon) {
        // Fallback to a default icon or null if an icon is missing in a set
        const FallbackIcon = iconSets.heroicons[name] as React.FC<React.SVGProps<SVGSVGElement>>;
        return FallbackIcon ? <FallbackIcon {...props} /> : null;
    }
    return <SpecificIcon {...props} />;
  };
  IconComponent.displayName = name;
  return IconComponent;
};

// Export each icon
export const PlusIcon = createIconComponent('PlusIcon');
export const GearIcon = createIconComponent('GearIcon');
export const FileIcon = createIconComponent('FileIcon');
export const InfoIcon = createIconComponent('InfoIcon');
export const FileCodeIcon = createIconComponent('FileCodeIcon');
export const CommandIcon = createIconComponent('CommandIcon');
export const FolderPlusIcon = createIconComponent('FolderPlusIcon');
export const SearchIcon = createIconComponent('SearchIcon');
export const SparklesIcon = createIconComponent('SparklesIcon');
export const TrashIcon = createIconComponent('TrashIcon');
export const UndoIcon = createIconComponent('UndoIcon');
export const RedoIcon = createIconComponent('RedoIcon');
export const CopyIcon = createIconComponent('CopyIcon');
export const CheckIcon = createIconComponent('CheckIcon');
export const SunIcon = createIconComponent('SunIcon');
export const MoonIcon = createIconComponent('MoonIcon');
export const DownloadIcon = createIconComponent('DownloadIcon');
export const ChevronDownIcon = createIconComponent('ChevronDownIcon');
export const ChevronRightIcon = createIconComponent('ChevronRightIcon');
export const FolderIcon = createIconComponent('FolderIcon');
export const FolderOpenIcon = createIconComponent('FolderOpenIcon');
export const XIcon = createIconComponent('XIcon');
