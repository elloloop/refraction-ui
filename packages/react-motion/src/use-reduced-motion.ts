import * as React from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether the user has asked for reduced motion. Returns `false` during SSR
 * and the first client render (so markup matches), then tracks the media
 * query live. The stylesheet already makes every pattern inert under the
 * query; use this hook for JS-driven decisions (e.g. skipping a re-key).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(QUERY)
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}
