'use client';

import Image from 'next/image';
import { createPngDataUri } from 'unlazy/thumbhash';

export function Photo({
  src,
  title,
  thumbhash,
  priority,
}: {
  src: string;
  title: string;
  thumbhash: string;
  priority: boolean;
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow-md">
      <Image
        alt={title}
        src={src}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFh"
        placeholder="blur"
        fill
        sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
