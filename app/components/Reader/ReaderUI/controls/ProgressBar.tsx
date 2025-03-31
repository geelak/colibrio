'use client';

import React from 'react';

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    onPageChange(newPage - 1); // Adjust for 0-based index
  };

  return (
    <input
      type="range"
      min={1}
      max={totalPages}
      value={currentPage}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className="w-40 h-2 rounded-full appearance-none bg-neutral-200 dark:bg-neutral-700"
      style={{
        accentColor: 'var(--color-primary)',
      }}
    />
  );
}; 