import Image from 'next/image';
import { cn } from '@/lib/utils';

/** The G&G logo on a white chip, pinned to the top-left corner of a bike photo. The photo's wrapper must be `relative`. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-white/95 p-1 shadow-md ring-1 ring-black/10', className)}>
      <Image src="/logo.png" alt="" width={620} height={398} sizes="72px" className="h-auto w-11 sm:w-14" />
    </span>
  );
}
