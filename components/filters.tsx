'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  SearchParams,
  parseSearchParams,
  stringifySearchParams,
} from '@/lib/url-state';

const LISTS = [
  {
    name: 'Popular',
    isbns:
      '0671027034,0735211299,0061122416,1250123828,020161622X,0062316095,081298840X,1491904240,0441172717,0451191145,0060555661,0156012197,1451648537,042528462X,0316769487,0062457713,0451191153,0486278077,0671733354,1455586692,0393316041,081121875X,1849967202,0195374614',
  },
  {
    name: 'Classics',
    isbns:
      '0140449264,0451524934,0679783261,0141182806,0142437239,0743273567,0141439602,0679785892,0141442468,0553212419,0140449108,0192833556,0142437336,0061122416,0679407584,0140283331,0140449272,0143039431,0486415864,0140449086,0486282112,0486415864,019283398X,0140449264,0141442336,0486282112,0486415864,0142437239,067973452X,0140449132,0140441185,0679732764,0140449264,0679732268,0451526929,014243762X,0140449248,0199535566,0679735776,0140449264,014118126X,0199535566,067973452X,0142437476,0679732233,0486284735,0140449043,0140449264,0486282112,0199535566,0140449248,0142437239,0141439513,0486415864,0140449442,0140449086',
  },
  {
    name: 'Sci-Fi & Fantasy',
    isbns:
      '0441172717,0345339703,0553293354,0345453743,055357342X,0060850523,0812504824,0345349571,055357339X,0345337662,0345339681,0345391802,0553283685,0553291442,0553573403,0345453751,0345337697,0345538374,0064404994,0345388827,0345370775,0345337581,0345340981,0553293370,0345538374,0553293354,0553380168,0812550706,055357342X,0345391802,0345339703,0441007465,0345337697,055327839X,055357342X,0345337697,0812536355,0345339703,055338256X,0345341929,055327839X,0345355355,0553291442,0345453743,0345337697,0553380133,0441007465,0345337697,0345391802,0345339703,055357342X,0345349571,0345339703,0345339681,0345341929,0345391802',
  },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'ita', label: 'Italian' },
  { value: 'ara', label: 'Arabic' },
  { value: 'fre', label: 'French' },
  { value: 'ger', label: 'German' },
  { value: 'ind', label: 'Indonesian' },
  { value: 'por', label: 'Portuguese' },
];

interface FilterProps {
  onFilterChange: (filters: OramaFilters) => void;
  initialFilters?: SearchParams;
}

interface OramaFilters {
  year?: { lte?: number };
  rating?: { gte?: number };
  language?: string;
  pages?: { lte?: number };
  isbn?: string[];
}

function FilterBase({ onFilterChange, initialFilters = {} }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const parsedParams: SearchParams = {
    ...initialFilters,
    search: searchParams?.get('search') || undefined,
    yr: searchParams?.get('yr') || undefined,
    rtg: searchParams?.get('rtg') || undefined,
    lng: searchParams?.get('lng') || undefined,
    pgs: searchParams?.get('pgs') || undefined,
    isbn: searchParams?.get('isbn') || undefined
  };

  const [optimisticFilters, setOptimisticFilters] = 
    useOptimistic<SearchParams>(parsedParams || {});

  const yearValue = Number(parsedParams?.yr) || 2023;
  const ratingValue = Number(parsedParams?.rtg) || 0;
  const pagesValue = Number(parsedParams?.pgs) || 1000;
  const languageValue = parsedParams?.lng || 'en';

  console.log(JSON.stringify(optimisticFilters, null, 2));

  const handleFilterChange = (
    filterType: keyof SearchParams,
    value: string | undefined
  ) => {
    if (!searchParams) return;
    
    startTransition(() => {
      console.log(filterType, value);
      const newFilters = { 
        ...optimisticFilters,
        search: searchParams?.get('search') || undefined,
        [filterType]: value || undefined 
      };
      
      (Object.keys(newFilters) as Array<keyof SearchParams>).forEach(key => {
        if (newFilters[key] === undefined) {
          delete newFilters[key];
        }
      });

      setOptimisticFilters(newFilters);
      const newSearchParams = stringifySearchParams(newFilters);
      router.push(`/?${newSearchParams}`);

      const oramaFilters: OramaFilters = {};
      if (newFilters.yr) oramaFilters.year = { lte: parseInt(newFilters.yr) };
      if (newFilters.rtg) oramaFilters.rating = { gte: parseFloat(newFilters.rtg) };
      if (newFilters.lng) oramaFilters.language = newFilters.lng;
      if (newFilters.pgs) oramaFilters.pages = { lte: parseInt(newFilters.pgs) };
      if (newFilters.isbn) oramaFilters.isbn = newFilters.isbn.split(',');

      onFilterChange(oramaFilters);
    });
  };

  const handleListToggle = (isbns: string) => {
    const newIsbns = isbns.split(',');
    const currentIsbns = optimisticFilters.isbn?.split(',') || [];

    if (currentIsbns.includes(newIsbns[0])) {
      const updatedIsbns = currentIsbns.filter(
        (isbn) => !newIsbns.includes(isbn)
      );
      handleFilterChange('isbn', updatedIsbns.join(',') || undefined);
    } else {
      handleFilterChange('isbn', isbns);
    }
  };

  const handleClearFilters = () => {
    const searchQuery = searchParams.get('search');
    const newFilters = searchQuery ? { search: searchQuery } : {};
    setOptimisticFilters(newFilters);
    router.push(searchQuery ? `/?search=${searchQuery}` : '/');
    onFilterChange({});
  };

  return (
    <div
      data-pending={isPending ? '' : undefined}
      className="flex-shrink-0 flex flex-col h-full bg-white"
    >
      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-4">
          <div>
            <Label htmlFor="year-range">Publication Year</Label>
            <Slider
              id="year-range"
              min={1950}
              max={2023}
              step={10}
              value={[yearValue]}
              onValueChange={([value]) =>
                handleFilterChange('yr', value.toString())
              }
              className="mt-2"
            />
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>1950</span>
              <span>{yearValue}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="rating">Minimum Rating</Label>
            <Slider
              id="rating"
              min={0}
              max={5}
              step={0.5}
              value={[ratingValue]}
              onValueChange={([value]) =>
                handleFilterChange('rtg', value.toString())
              }
              className="mt-2"
            />
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>0</span>
              <span>{ratingValue} stars</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={languageValue}
              onValueChange={(value) => handleFilterChange('lng', value)}
            >
              <SelectTrigger id="language" className="mt-2">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="page-range">Number of Pages</Label>
            <Slider
              id="page-range"
              min={1}
              max={1000}
              step={100}
              value={[pagesValue]}
              onValueChange={([value]) =>
                handleFilterChange('pgs', value.toString())
              }
              className="mt-2"
            />
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>1</span>
              <span>{pagesValue}</span>
            </div>
          </div>

          <div>
            <Label>Book Lists</Label>
            <ScrollArea className="h-[200px] mt-2">
              {LISTS.map((list) => (
                <div
                  key={list.name}
                  className="flex items-center space-x-2 py-1"
                >
                  <Checkbox
                    id={`list-${list.name.toLowerCase()}`}
                    checked={
                      optimisticFilters.isbn?.split(',')[0] ===
                      list.isbns.split(',')[0]
                    }
                    onCheckedChange={() => handleListToggle(list.isbns)}
                  />
                  <Label htmlFor={`list-${list.name.toLowerCase()}`}>
                    {list.name}
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </ScrollArea>

      {Object.keys(optimisticFilters).length > 0 && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

export function FilterFallback() {
  return <FilterBase onFilterChange={(filters) => console.log('Fallback filters:', filters)} />;
}

export function Filter() {
  return <FilterBase onFilterChange={() => {}} initialFilters={{}} />;
}
