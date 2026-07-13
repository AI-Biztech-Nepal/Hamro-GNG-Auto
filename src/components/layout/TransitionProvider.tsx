"use client"

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

/**
 * TransitionProvider component handles high-speed page transition animations.
 * Refined for a snappy "Experienced Developer" feel with reduced overhead.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Immediate children update for speed
    setDisplayChildren(children);
    
    // Smooth scroll to top without delay
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [children, pathname]);

  return (
    <div 
      key={pathname} 
      className="page-transition-premium min-h-screen flex flex-col"
    >
      {displayChildren}
    </div>
  );
}
