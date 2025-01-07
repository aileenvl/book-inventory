import { Suspense } from 'react';
import { BooksGrid } from '@/components/grid';
import { BookPagination } from '@/components/book-pagination';
import { ITEMS_PER_PAGE } from '@/lib/db/queries';
import { parseSearchParams } from '@/lib/url-state';
import { OramaClient } from '@oramacloud/client';
import { SearchParamsWrapper } from '@/components/search-params-wrapper';

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const parsedSearchParams = parseSearchParams(resolvedParams);

  if (!client) {
    throw new Error('Orama client failed to initialize');
  }

  const query = parsedSearchParams.search || '';
  const where: Record<string, any> = {};
  if (parsedSearchParams.yr) where.publication_year = { lte: parseInt(parsedSearchParams.yr) };
  if (parsedSearchParams.rtg) where.average_rating = { gte: parseFloat(parsedSearchParams.rtg) };
  if (parsedSearchParams.lng) where.language_code = parsedSearchParams.lng;
  if (parsedSearchParams.pgs) where.num_pages = { lte: parseInt(parsedSearchParams.pgs) };
  if (parsedSearchParams.isbn) where.isbn = parsedSearchParams.isbn.split(',');

  const currentPage = Math.max(1, Number(parsedSearchParams.page) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const results = await client.search({
    term: query,
    mode: 'fulltext',
    limit: ITEMS_PER_PAGE,
    offset: offset,
    where,
    sortBy: {
      property: "publication_year",
      order: "asc"
    },
  });

  const books = results?.hits.map(hit => ({
    id: hit.id,
    document: hit.document
  })) || [];

  const totalResults = results?.count || 0;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  return (
    <SearchParamsWrapper>
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto min-h-[200px]">
          <div className="group-has-[[data-pending]]:animate-pulse p-4">
            <BooksGrid books={books} searchParams={parsedSearchParams} />
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
          <Suspense fallback={null}>
            <BookPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              searchParams={parsedSearchParams}
            />
          </Suspense>
        </div>
      </div>
    </SearchParamsWrapper>
  );
}
