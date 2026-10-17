import { vi } from 'vitest'

/**
 * Make `Intl.DateTimeFormat` treat `runtimeLocale` as the runtime's default
 * locale, as if the process (or browser) were configured for it. Explicit
 * locales are untouched. Undo with `vi.unstubAllGlobals()`.
 */
export function stubRuntimeLocale(runtimeLocale: string): void {
  const RealDateTimeFormat = Intl.DateTimeFormat
  const DateTimeFormat = function (
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    return new RealDateTimeFormat(locales ?? runtimeLocale, options)
  } as unknown as typeof Intl.DateTimeFormat
  vi.stubGlobal('Intl', Object.assign(Object.create(Intl) as typeof Intl, { DateTimeFormat }))
}
