'use client';

import React from 'react';
import Div100vh from 'react-div-100vh';

interface ClientBodyProps {
  children: React.ReactNode;
  geistSans: string;
  geistMono: string;
}

export default function ClientBody({ children, geistSans, geistMono }: ClientBodyProps) {
  return (
    <body className={`${geistSans} ${geistMono} antialiased overflow-hidden w-screen`}>
      <Div100vh>
        {children}
      </Div100vh>
    </body>
  );
} 