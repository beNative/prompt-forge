import React from 'react';
import { useIconSet } from '../hooks/useIconSet';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';

type IconProps = {
  className?: string;
};

export const GearIcon: React.FC<IconProps> = (props) => {
  const { iconSet } = useIconSet();
  return iconSet === 'lucide' ? <LucideIcons.GearIcon {...props} /> : <HeroIcons.GearIcon {...props} />;
};

export const PlusIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.PlusIcon {...props} /> : <HeroIcons.PlusIcon {...props} />;
};

export const TrashIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.TrashIcon {...props} /> : <HeroIcons.TrashIcon {...props} />;
};

export const SparklesIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.SparklesIcon {...props} /> : <HeroIcons.SparklesIcon {...props} />;
};

export const FileIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.FileIcon {...props} /> : <HeroIcons.FileIcon {...props} />;
};

export const InfoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.InfoIcon {...props} /> : <HeroIcons.InfoIcon {...props} />;
};

export const FileCodeIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.FileCodeIcon {...props} /> : <HeroIcons.FileCodeIcon {...props} />;
};

export const SaveIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.SaveIcon {...props} /> : <HeroIcons.SaveIcon {...props} />;
};

export const ChevronDownIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.ChevronDownIcon {...props} /> : <HeroIcons.ChevronDownIcon {...props} />;
};

export const ChevronRightIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.ChevronRightIcon {...props} /> : <HeroIcons.ChevronRightIcon {...props} />;
};

export const UndoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.UndoIcon {...props} /> : <HeroIcons.UndoIcon {...props} />;
};

export const RedoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.RedoIcon {...props} /> : <HeroIcons.RedoIcon {...props} />;
};

export const CommandIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.CommandIcon {...props} /> : <HeroIcons.CommandIcon {...props} />;
};

export const SunIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.SunIcon {...props} /> : <HeroIcons.SunIcon {...props} />;
};

export const MoonIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.MoonIcon {...props} /> : <HeroIcons.MoonIcon {...props} />;
};

export const FolderIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.FolderIcon {...props} /> : <HeroIcons.FolderIcon {...props} />;
};

export const FolderOpenIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.FolderOpenIcon {...props} /> : <HeroIcons.FolderOpenIcon {...props} />;
};

export const FolderPlusIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.FolderPlusIcon {...props} /> : <HeroIcons.FolderPlusIcon {...props} />;
};

export const KeyboardIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.KeyboardIcon {...props} /> : <HeroIcons.KeyboardIcon {...props} />;
};

export const CopyIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.CopyIcon {...props} /> : <HeroIcons.CopyIcon {...props} />;
};

export const CheckIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    return iconSet === 'lucide' ? <LucideIcons.CheckIcon {...props} /> : <HeroIcons.CheckIcon {...props} />;
};