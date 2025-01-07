import {
  StarIcon,
  BookOpenIcon,
  GlobeIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/components/photo';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { SearchParams, stringifySearchParams } from '@/lib/url-state';
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
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (!client) {
    throw new Error('Failed to initialize Orama client');
  }

  const response = await client.search({
    term: resolvedParams.id,
    mode: 'fulltext',
  });

  if (!response) {
    throw new Error('Failed to search for book');
  }

  if (response.hits.length === 0) {
    throw new Error('Book not found');
  }

  const rawBook = response.hits[0].document;
  const book = {
    ...rawBook,
    authors: [rawBook.authors.name],
    ratings_count: 0,
    thumbhash: null,
  };

  return (
    <SearchParamsWrapper>
      <ScrollArea className="px-4 h-full">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href={`/?${stringifySearchParams(resolvedSearchParams)}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Books
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Photo
              priority
              src={book.image_url}
              title={book.title}
              thumbhash={book.thumbhash}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <div className="text-muted-foreground mb-4">
              by {book.authors.join(', ')}
            </div>
            <div className="flex items-center mb-4">
              <StarRating rating={book.average_rating} />
              <span className="text-lg font-semibold">
                {Number(book.average_rating).toFixed(1)}
              </span>
              <span className="text-gray-600 ml-2">
                ({Number(book.ratings_count).toLocaleString()} ratings)
              </span>
            </div>

            <p className="text-gray-700 mb-6">{book.description}</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center">
                <BookOpenIcon className="w-4 h-4 mr-2" />
                <span>{book.num_pages?.toLocaleString()} pages</span>
              </div>
              <div className="flex items-center">
                <GlobeIcon className="w-4 h-4 mr-2" />
                <span>Language: {book.language_code}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>Published: {book.publication_year}</span>
              </div>
              <div className="flex items-center">
                <span>ISBN: {book.isbn || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </SearchParamsWrapper>
  );
}

function StarRating({ rating }: { rating: string | null }) {
  if (rating === null) return null;

  return (
    <div className="flex items-center mr-4">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(Number(rating))
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
