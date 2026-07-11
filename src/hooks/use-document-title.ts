import { useEffect } from 'react';

declare global {
  interface Window {
    TITLE_PREFIX?: string;
  }
}

const DEFAULT_PREFIX = 'dc: ';

/** Title prefix by priority: window.TITLE_PREFIX (runtime) > PUBLIC_TITLE_PREFIX (build) > 'dc: '. */
function getPrefix(): string {
  return window.TITLE_PREFIX ?? process.env.PUBLIC_TITLE_PREFIX ?? DEFAULT_PREFIX;
}

/** Sets document.title to `${prefix}${title}`. Pass null/undefined to leave it unchanged. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title != null) {
      document.title = `${getPrefix()}${title}`;
    }
  }, [title]);
}
