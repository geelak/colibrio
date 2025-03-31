'use client';

import React from 'react';
import { BookmarkButton } from './BookmarkButton';
import { TOCButton } from './TOCButton';
import { SearchButton } from './SearchButton';
import { SettingsButton } from './SettingsButton';
import { AccountButton } from './AccountButton';

interface ButtonGroupProps {
  onBookmark: (e: React.MouseEvent) => void;
  onTOC: (e: React.MouseEvent) => void;
  onSearch: (e: React.MouseEvent) => void;
  onSettings: (e: React.MouseEvent) => void;
  onAccount: (e: React.MouseEvent) => void;
  isBookmarked?: boolean;
  activeTool?: 'toc' | 'search' | 'settings' | 'account' | null;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  onBookmark,
  onTOC,
  onSearch,
  onSettings,
  onAccount,
  isBookmarked = false,
  activeTool = null
}) => {
  return (
    <div className="flex items-center gap-1">
      <BookmarkButton 
        onClick={onBookmark} 
        isActive={isBookmarked} 
      />
      <TOCButton 
        onClick={onTOC} 
        isActive={activeTool === 'toc'} 
      />
      <SearchButton 
        onClick={onSearch} 
        isActive={activeTool === 'search'} 
      />
      <SettingsButton 
        onClick={onSettings} 
        isActive={activeTool === 'settings'} 
      />
      <AccountButton 
        onClick={onAccount} 
        isActive={activeTool === 'account'} 
      />
    </div>
  );
}; 