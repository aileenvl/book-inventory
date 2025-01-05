'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { BooksGrid } from '@/components/grid';
import { OramaClient } from '@oramacloud/client';
import { ITEMS_PER_PAGE } from '@/lib/db/queries';

const client = new OramaClient({
  endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT,
  api_key: process.env.NEXT_PUBLIC_ORAMA_API_KEY
});

export default function Page() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const prevSearchParamsRef = useRef('');

  useEffect(() => {
    const currentSearchParams = searchParams.toString();
    
    if (prevSearchParamsRef.current === currentSearchParams) {
      return;
    }
    
    prevSearchParamsRef.current = currentSearchParams;

    async function search() {
      try {
        const query = searchParams.get('search') || '';
        const year = searchParams.get('yr');
        const rating = searchParams.get('rtg');
        const language = searchParams.get('lng');
        const pages = searchParams.get('pgs');
        const isbn = searchParams.get('isbn');

        const where: Record<string, any> = {};
        if (year) where.publication_year = { lte: parseInt(year) };
        if (rating) where.average_rating = { gte: parseFloat(rating) };
        if (language) where.language_code = language;
        if (pages) where.num_pages = { lte: parseInt(pages) };
        if (isbn) where.isbn = isbn.split(',');
        console.log(where);

        const results = await client.search({
          term: query,
          mode: 'hybrid',
          limit: ITEMS_PER_PAGE,
          where,
          sortBy: {
            property: "publication_year",
            order: "asc" 
          },
        });

        setBooks(results.hits.map(hit => ({
          id: hit.id,
          document: hit.document
        })));
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    search();
  }, [searchParams]);

  return (
    <div className="flex-grow overflow-auto min-h-[200px]">
      <div className="group-has-[[data-pending]]:animate-pulse p-4">
        <BooksGrid books={books} searchParams={searchParams} />
      </div>
    </div>
  );
}
