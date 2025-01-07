'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchParamsContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  return children;
}

export function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
} 