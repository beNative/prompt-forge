
import React from 'react';
import { useIconSet } from '../hooks/useIconSet';
import * as HeroIcons from './iconsets/Heroicons';
import * as LucideIcons from './iconsets/Lucide';
import * as FeatherIcons from './iconsets/Feather';
import * as TablerIcons from './iconsets/Tabler';
import * as MaterialIcons from './iconsets/Material';

type IconProps = {
  className?: string;
};

export const GearIcon: React.FC<IconProps> = (props) => {
  const { iconSet } = useIconSet();
  switch (iconSet) {
    case 'lucide': return <LucideIcons.GearIcon {...props} />;
    case 'feather': return <FeatherIcons.GearIcon {...props} />;
    case 'tabler': return <TablerIcons.GearIcon {...props} />;
    case 'material': return <MaterialIcons.GearIcon {...props} />;
    case 'heroicons': default: return <HeroIcons.GearIcon {...props} />;
  }
};

export const PlusIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.PlusIcon {...props} />;
        case 'feather': return <FeatherIcons.PlusIcon {...props} />;
        case 'tabler': return <TablerIcons.PlusIcon {...props} />;
        case 'material': return <MaterialIcons.PlusIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.PlusIcon {...props} />;
    }
};

export const TrashIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.TrashIcon {...props} />;
        case 'feather': return <FeatherIcons.TrashIcon {...props} />;
        case 'tabler': return <TablerIcons.TrashIcon {...props} />;
        case 'material': return <MaterialIcons.TrashIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.TrashIcon {...props} />;
    }
};

export const SparklesIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.SparklesIcon {...props} />;
        case 'feather': return <FeatherIcons.SparklesIcon {...props} />;
        case 'tabler': return <TablerIcons.SparklesIcon {...props} />;
        case 'material': return <MaterialIcons.SparklesIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.SparklesIcon {...props} />;
    }
};

export const FileIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.FileIcon {...props} />;
        case 'feather': return <FeatherIcons.FileIcon {...props} />;
        case 'tabler': return <TablerIcons.FileIcon {...props} />;
        case 'material': return <MaterialIcons.FileIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.FileIcon {...props} />;
    }
};

export const InfoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.InfoIcon {...props} />;
        case 'feather': return <FeatherIcons.InfoIcon {...props} />;
        case 'tabler': return <TablerIcons.InfoIcon {...props} />;
        case 'material': return <MaterialIcons.InfoIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.InfoIcon {...props} />;
    }
};

export const TerminalIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.TerminalIcon {...props} />;
        case 'feather': return <FeatherIcons.TerminalIcon {...props} />;
        case 'tabler': return <TablerIcons.TerminalIcon {...props} />;
        case 'material': return <MaterialIcons.TerminalIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.TerminalIcon {...props} />;
    }
};

export const DownloadIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.DownloadIcon {...props} />;
        case 'feather': return <FeatherIcons.DownloadIcon {...props} />;
        case 'tabler': return <TablerIcons.DownloadIcon {...props} />;
        case 'material': return <MaterialIcons.DownloadIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.DownloadIcon {...props} />;
    }
};

export const ChevronDownIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.ChevronDownIcon {...props} />;
        case 'feather': return <FeatherIcons.ChevronDownIcon {...props} />;
        case 'tabler': return <TablerIcons.ChevronDownIcon {...props} />;
        case 'material': return <MaterialIcons.ChevronDownIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.ChevronDownIcon {...props} />;
    }
};

export const ChevronRightIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.ChevronRightIcon {...props} />;
        case 'feather': return <FeatherIcons.ChevronRightIcon {...props} />;
        case 'tabler': return <TablerIcons.ChevronRightIcon {...props} />;
        case 'material': return <MaterialIcons.ChevronRightIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.ChevronRightIcon {...props} />;
    }
};

export const UndoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.UndoIcon {...props} />;
        case 'feather': return <FeatherIcons.UndoIcon {...props} />;
        case 'tabler': return <TablerIcons.UndoIcon {...props} />;
        case 'material': return <MaterialIcons.UndoIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.UndoIcon {...props} />;
    }
};

export const RedoIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.RedoIcon {...props} />;
        case 'feather': return <FeatherIcons.RedoIcon {...props} />;
        case 'tabler': return <TablerIcons.RedoIcon {...props} />;
        case 'material': return <MaterialIcons.RedoIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.RedoIcon {...props} />;
    }
};

export const CommandIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.CommandIcon {...props} />;
        case 'feather': return <FeatherIcons.CommandIcon {...props} />;
        case 'tabler': return <TablerIcons.CommandIcon {...props} />;
        case 'material': return <MaterialIcons.CommandIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.CommandIcon {...props} />;
    }
};

export const SunIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.SunIcon {...props} />;
        case 'feather': return <FeatherIcons.SunIcon {...props} />;
        case 'tabler': return <TablerIcons.SunIcon {...props} />;
        case 'material': return <MaterialIcons.SunIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.SunIcon {...props} />;
    }
};

export const MoonIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.MoonIcon {...props} />;
        case 'feather': return <FeatherIcons.MoonIcon {...props} />;
        case 'tabler': return <TablerIcons.MoonIcon {...props} />;
        case 'material': return <MaterialIcons.MoonIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.MoonIcon {...props} />;
    }
};

export const FolderIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.FolderIcon {...props} />;
        case 'feather': return <FeatherIcons.FolderIcon {...props} />;
        case 'tabler': return <TablerIcons.FolderIcon {...props} />;
        case 'material': return <MaterialIcons.FolderIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.FolderIcon {...props} />;
    }
};

export const FolderOpenIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.FolderOpenIcon {...props} />;
        case 'feather': return <FeatherIcons.FolderOpenIcon {...props} />;
        case 'tabler': return <TablerIcons.FolderOpenIcon {...props} />;
        case 'material': return <MaterialIcons.FolderOpenIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.FolderOpenIcon {...props} />;
    }
};

export const FolderPlusIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.FolderPlusIcon {...props} />;
        case 'feather': return <FeatherIcons.FolderPlusIcon {...props} />;
        case 'tabler': return <TablerIcons.FolderPlusIcon {...props} />;
        case 'material': return <MaterialIcons.FolderPlusIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.FolderPlusIcon {...props} />;
    }
};

export const KeyboardIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.KeyboardIcon {...props} />;
        case 'feather': return <FeatherIcons.KeyboardIcon {...props} />;
        case 'tabler': return <TablerIcons.KeyboardIcon {...props} />;
        case 'material': return <MaterialIcons.KeyboardIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.KeyboardIcon {...props} />;
    }
};

export const CopyIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.CopyIcon {...props} />;
        case 'feather': return <FeatherIcons.CopyIcon {...props} />;
        case 'tabler': return <TablerIcons.CopyIcon {...props} />;
        case 'material': return <MaterialIcons.CopyIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.CopyIcon {...props} />;
    }
};

export const CheckIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.CheckIcon {...props} />;
        case 'feather': return <FeatherIcons.CheckIcon {...props} />;
        case 'tabler': return <TablerIcons.CheckIcon {...props} />;
        case 'material': return <MaterialIcons.CheckIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.CheckIcon {...props} />;
    }
};

export const SearchIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.SearchIcon {...props} />;
        case 'feather': return <FeatherIcons.SearchIcon {...props} />;
        case 'tabler': return <TablerIcons.SearchIcon {...props} />;
        case 'material': return <MaterialIcons.SearchIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.SearchIcon {...props} />;
    }
};

export const XIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.XIcon {...props} />;
        case 'feather': return <FeatherIcons.XIcon {...props} />;
        case 'tabler': return <TablerIcons.XIcon {...props} />;
        case 'material': return <MaterialIcons.XIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.XIcon {...props} />;
    }
};

export const DocumentDuplicateIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.DocumentDuplicateIcon {...props} />;
        case 'feather': return <FeatherIcons.DocumentDuplicateIcon {...props} />;
        case 'tabler': return <TablerIcons.DocumentDuplicateIcon {...props} />;
        case 'material': return <MaterialIcons.DocumentDuplicateIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.DocumentDuplicateIcon {...props} />;
    }
};

export const HistoryIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.HistoryIcon {...props} />;
        case 'feather': return <FeatherIcons.HistoryIcon {...props} />;
        case 'tabler': return <TablerIcons.HistoryIcon {...props} />;
        case 'material': return <MaterialIcons.HistoryIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.HistoryIcon {...props} />;
    }
};

export const ArrowLeftIcon: React.FC<IconProps> = (props) => {
    const { iconSet } = useIconSet();
    switch (iconSet) {
        case 'lucide': return <LucideIcons.ArrowLeftIcon {...props} />;
        case 'feather': return <FeatherIcons.ArrowLeftIcon {...props} />;
        case 'tabler': return <TablerIcons.ArrowLeftIcon {...props} />;
        case 'material': return <MaterialIcons.ArrowLeftIcon {...props} />;
        case 'heroicons': default: return <HeroIcons.ArrowLeftIcon {...props} />;
    }
};
