'use client';

import Link from 'next/link';
import { Photo } from './photo';
import { SearchParams, stringifySearchParams } from '@/lib/url-state';

interface Book {
  id: string;
  document: {
    isbn: string;
    title: string;
    image_url: string;
    thumbhash?: string;
  };
}

export function BooksGrid({
  books,
  searchParams,
}: {
  books: Book[];
  searchParams: SearchParams;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {!books?.length ? (
        <p className="text-center text-muted-foreground col-span-full">
          No books found.
        </p>
      ) : (
        books.map((book, index) => (
          <BookLink
            key={book.document.isbn}
            priority={index < 10}
            book={book}
            searchParams={searchParams}
          />
        ))
      )}
    </div>
  );
}

function BookLink({
  priority,
  book,
  searchParams,
}: {
  priority: boolean;
  book: Book;
  searchParams: SearchParams;
}) {
  if (!book.document.title) {
    console.warn(`Book ${book.id} has no title`);
    return null;
  }

  const noFilters = Object.values(searchParams).every((v) => v === undefined);

  return (
    <Link
      href={`/${book.document.isbn}?${stringifySearchParams(searchParams)}`}
      className="block transition ease-in-out md:hover:scale-105"
      prefetch={noFilters}
    >
      <Photo
        src={book.document.image_url!}
        title={book.document.title}
        thumbhash={book.document.thumbhash!}
        priority={priority}
      />
    </Link>
  );
}
