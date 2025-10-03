'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbOverrides = Record<string, string>;

type BreadcrumbsContextValue = {
  items: BreadcrumbItem[];
  setOverrides: (overrides: BreadcrumbOverrides) => void;
  setTrail: (items: BreadcrumbItem[]) => void;
  push: (item: BreadcrumbItem) => void;
  pop: () => void;
  clear: () => void;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

function humanize(segment: string): string {
  const replaced = segment.replace(/[-_]+/g, ' ');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1);
}

function buildFromPath(
  pathname: string,
  overrides: BreadcrumbOverrides
): BreadcrumbItem[] {
  const segments = pathname
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let href = '';
  for (const segment of segments) {
    href += `/${segment}`;
    const key = href; // use cumulative href as key for overrides
    const label = overrides[key] ?? humanize(segment);
    items.push({ label, href });
  }
  return items;
}

export function BreadcrumbsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const overridesRef = useRef<BreadcrumbOverrides>({});
  const [manualTrail, setManualTrail] = useState<BreadcrumbItem[] | null>(null);

  const derivedItems = useMemo(() => {
    if (manualTrail) return manualTrail;
    return buildFromPath(pathname ?? '/', overridesRef.current);
  }, [pathname, manualTrail]);

  const setOverrides = useCallback(
    (overrides: BreadcrumbOverrides) => {
      overridesRef.current = { ...overridesRef.current, ...overrides };
      // When overrides change and we're using derived mode, trigger recompute by nudging state
      if (manualTrail === null) {
        setManualTrail(prev => prev);
      }
    },
    [manualTrail]
  );

  const setTrail = useCallback((items: BreadcrumbItem[]) => {
    setManualTrail(items);
  }, []);

  const push = useCallback(
    (item: BreadcrumbItem) => {
      setManualTrail(prev =>
        prev
          ? [...prev, item]
          : [...buildFromPath(pathname ?? '/', overridesRef.current), item]
      );
    },
    [pathname]
  );

  const pop = useCallback(() => {
    setManualTrail(prev => {
      if (!prev || prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      return next.length === 0 ? null : next;
    });
  }, []);

  const clear = useCallback(() => {
    setManualTrail(null);
  }, []);

  const value: BreadcrumbsContextValue = useMemo(
    () => ({
      items: derivedItems,
      setOverrides,
      setTrail,
      push,
      pop,
      clear,
    }),
    [derivedItems, setOverrides, setTrail, push, pop, clear]
  );

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}

export function useBreadcrumbs(): BreadcrumbsContextValue {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbsProvider');
  }
  return ctx;
}

export default useBreadcrumbs;
