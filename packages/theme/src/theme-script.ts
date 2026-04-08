/**
 * Inline script for preventing theme flash on page load.
 * Inject this as a <script> tag in the <head> before any CSS.
 * Works with any framework (React, Angular, Astro, plain HTML).
 */

export function getThemeScript(
  storageKey = 'rfr-theme',
  attribute: 'class' | 'data-theme' = 'class',
): string {
  // This string is injected as innerHTML of a <script> tag.
  // It runs before any CSS/JS loads, preventing flash of wrong theme.
  return `(function(){try{var m=localStorage.getItem('${storageKey}');var s=window.matchMedia('(prefers-color-scheme:dark)').matches;var t=m==='dark'||(m!=='light'&&s)?'dark':'light';var d=document.documentElement;${
    attribute === 'class'
      ? "d.classList.remove('light','dark');d.classList.add(t);"
      : `d.setAttribute('${attribute}',t);`
  }d.style.colorScheme=t;}catch(e){}})()`
}
