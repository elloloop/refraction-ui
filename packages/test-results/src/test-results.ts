import type { AccessibilityProps } from '@refraction-ui/shared'

/** The execution status of a single test case. */
export type TestStatus = 'pass' | 'fail' | 'skip'

/** Data for a single test case result. */
export interface TestResultData {
  /** Unique identifier for the test. */
  id: string
  /** Human-readable test name. */
  name: string
  /** Execution status. */
  status: TestStatus
  /** How long the test took to run, in milliseconds. */
  durationMs?: number
  /** Expected value (shown in diff when the test fails). */
  expected?: string
  /** Actual value received (shown in diff when the test fails). */
  actual?: string
  /** Optional message — error message on failure, skip reason, etc. */
  message?: string
}

/** Aggregate counts derived from a list of test results. */
export interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  /** True when every test passed (failed === 0 and skipped === 0). */
  allPassed: boolean
}

export interface TestResultsAPI {
  /** ARIA attributes to spread on the list container (`role="list"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Compute aggregate summary counts from a list of {@link TestResultData}.
 *
 * Pure function — no side effects, safe to call during SSR.
 */
export function summarizeTests(results: TestResultData[]): TestSummary {
  let passed = 0
  let failed = 0
  let skipped = 0

  for (const r of results) {
    if (r.status === 'pass') passed++
    else if (r.status === 'fail') failed++
    else skipped++
  }

  return {
    total: results.length,
    passed,
    failed,
    skipped,
    allPassed: failed === 0 && skipped === 0 && results.length > 0,
  }
}

/**
 * Build the framework-agnostic container props for a test results list.
 *
 * Returns `role="list"` plus data attributes that adapters spread onto their
 * container element. The adapter is responsible for rendering individual items
 * with `role="listitem"`.
 */
export function createTestResults(): TestResultsAPI {
  const ariaProps: Partial<AccessibilityProps> = {
    role: 'list',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'test-results',
  }

  return { ariaProps, dataAttributes }
}
