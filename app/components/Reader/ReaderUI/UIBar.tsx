import { Suspense } from 'react';
import ClientUIBar from './ClientUIBar';
import type { UIBarProps } from './types';

export default function UIBar(props: UIBarProps) {
  return (
    <Suspense 
      fallback={
        <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-50">
          <div className="backdrop-blur-md rounded-full cursor-pointer px-3 py-1"
               style={{
                 backgroundColor: 'rgba(var(--color-background-rgb), 0.75)',
                 minWidth: '60px'
               }} />
        </div>
      }
    >
      <ClientUIBar {...props} />
    </Suspense>
  );
} 