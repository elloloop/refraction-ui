export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function parseHeadings(container: HTMLElement, selectors = 'h2, h3, h4'): TocItem[] {
  const headings = Array.from(container.querySelectorAll(selectors));
  return headings.map(h => ({
    id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
    text: h.textContent || '',
    level: parseInt(h.tagName.charAt(1), 10)
  })).filter(h => h.id !== ''); // Ensure headings have IDs
}

export function observeHeadings(
  headingIds: string[],
  callback: (activeId: string) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    // Find the first intersecting entry
    for (const entry of entries) {
      if (entry.isIntersecting) {
        callback(entry.target.id);
        break; // Or handle multiple, but usually we just care about one
      }
    }
  }, { rootMargin: '0px 0px -80% 0px', ...options });

  headingIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}
