import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchParamsWrapper } from '@/components/search-params-wrapper';

export default function NotFound() {
  return (
    <SearchParamsWrapper>
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Not Found</h2>
        <p className="text-muted-foreground mb-4">Could not find requested resource</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </SearchParamsWrapper>
  );
}
