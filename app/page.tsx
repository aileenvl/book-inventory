'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BooksGrid } from '@/components/grid';
import { OramaClient } from '@oramacloud/client';
import { ITEMS_PER_PAGE } from '@/lib/db/queries';
import { SearchParams } from '@/lib/url-state';

let client: OramaClient | null;
try {
  client = new OramaClient({
    endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT || '',
    api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY || ''
  });
} catch (error) {
  console.error('Failed to initialize Orama client:', error);
  client = null;
}

export interface Book {
  id: string;
  document: any;
}

export default function Page() {
  const searchParamsObj = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useMemo<SearchParams>(() => ({
    search: searchParamsObj?.get('search') || undefined,
    yr: searchParamsObj?.get('yr') || undefined,
    rtg: searchParamsObj?.get('rtg') || undefined,
    lng: searchParamsObj?.get('lng') || undefined,
    pgs: searchParamsObj?.get('pgs') || undefined,
    isbn: searchParamsObj?.get('isbn') || undefined,
  }), [searchParamsObj]);

  useEffect(() => {
    if (!client) {
      setError('Orama client failed to initialize');
      return;
    }

    async function search() {
      try {
        if (!client) {
          throw new Error('Orama client failed to initialize');
        }

        const query = searchParams.search || '';
        const year = searchParams.yr;
        const rating = searchParams.rtg;
        const language = searchParams.lng;
        const pages = searchParams.pgs;
        const isbn = searchParams.isbn;

        const where: Record<string, any> = {};
        if (year) where.publication_year = { lte: parseInt(year) };
        if (rating) where.average_rating = { gte: parseFloat(rating) };
        if (language) where.language_code = language;
        if (pages) where.num_pages = { lte: parseInt(pages) };
        if (isbn) where.isbn = isbn.split(',');

        const results = await client.search({
          term: query,
          mode: 'fulltext',
          limit: ITEMS_PER_PAGE,
          where,
          sortBy: {
            property: "publication_year",
            order: "asc" 
          },
        });

        if (!results) {
          setBooks([]);
          return;
        }

        setBooks(results.hits.map(hit => ({
          id: hit.id,
          document: hit.document
        })));
      } catch (error) {
        console.error('Search error:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    }

    search();
  }, [searchParamsObj]);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex-grow overflow-auto min-h-[200px]">
      <Suspense fallback={<div className="animate-pulse p-4">Loading...</div>}>
        <div className="p-4">
          <BooksGrid books={books} searchParams={searchParams} />
        </div>
      </Suspense>
    </div>
  );
}
