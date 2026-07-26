/**
 * @refraction-ui/carousel — headless "carousel" store.
 *
 * Honest note: despite the name, this component is an expand/collapse panel
 * set (an accordion in disguise) — that is the behavior the React adapter and
 * the docs site demo (single/multiple open panels, collapsible toggles). The
 * state machine is therefore shared with `@refraction-ui/accordion` rather
 * than duplicated. A real slide-navigation carousel (active index, next/prev)
 * would be a different core; this package keeps the shipped behavior.
 */
import {
  createAccordion,
  isItemOpen,
  type AccordionAPI,
  type AccordionConfig,
  type AccordionState,
  type AccordionType,
  type AccordionValue,
} from '@refraction-ui/accordion'

/** Expansion mode: one item open at a time, or any number. */
export type CarouselType = AccordionType

/** Open item id (`single`) or ids (`multiple`). */
export type CarouselValue = AccordionValue

/** Options for {@link createCarousel}. Mirrors {@link AccordionConfig}. */
export interface CarouselConfig extends AccordionConfig {}

/** Snapshot of the store. Returned by `getState()`; treat as immutable. */
export interface CarouselState extends AccordionState {}

/** The framework-agnostic store. React/Astro adapters wrap this. */
export type CarouselAPI = AccordionAPI

/**
 * createCarousel — headless expand/collapse panel store. This is the
 * accordion state machine under the carousel name; see the package note.
 */
export function createCarousel(config: CarouselConfig = {}): CarouselAPI {
  return createAccordion(config)
}

/** Pure open-state check shared by every adapter. */
export { isItemOpen }
