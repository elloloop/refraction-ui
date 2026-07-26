import { ensureDistBuilt } from './harness'

// Vitest global setup — runs once per run, before any test file loads.
// The render tests import the meta's copied dist sources; make sure they
// exist. (Turbo normally runs the meta's `build` task first; this keeps bare
// `vitest` invocations from this package green too.)
export default function setup(): void {
  ensureDistBuilt()
}
