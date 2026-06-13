import * as React from 'react'
import {
  summarizeTests,
  createTestResults,
  testResultsContainerVariants,
  testResultsSummaryVariants,
  testRowVariants,
  testStatusBadgeVariants,
  testNameClass,
  testDurationClass,
  testDiffBlockVariants,
  testMessageClass,
  type TestResultData,
  type TestStatus,
} from '@refraction-ui/test-results'
import { cn } from '@refraction-ui/shared'

export type { TestResultData, TestStatus }

export interface TestResultsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'results'> {
  /** Array of test case results to display. */
  results: TestResultData[]
  /** When true, renders a summary bar showing "{passed}/{total} passed". */
  showSummary?: boolean
}

/**
 * TestResults — displays a list of test case results with pass/fail/skip
 * status, optional expected/actual diff for failures, and an optional summary
 * bar.
 *
 * Renders `role="list"` on the container; each row has `role="listitem"`.
 * Logic and styles come from the headless `@refraction-ui/test-results` core.
 */
export const TestResults = React.forwardRef<HTMLDivElement, TestResultsProps>(
  ({ results, showSummary = true, className, ...props }, ref) => {
    const summary = React.useMemo(() => summarizeTests(results), [results])
    const { ariaProps, dataAttributes } = createTestResults()

    const summaryOutcome = summary.failed > 0 ? 'fail' : summary.skipped > 0 ? 'skip' : 'pass'

    return (
      <div
        ref={ref}
        className={cn(testResultsContainerVariants(), className)}
        {...dataAttributes}
        {...props}
      >
        {showSummary && results.length > 0 && (
          <div
            className={testResultsSummaryVariants({ outcome: summaryOutcome })}
            aria-live="polite"
          >
            <span>{`${summary.passed}/${summary.total} passed`}</span>
            {summary.failed > 0 && <span>{`· ${summary.failed} failed`}</span>}
            {summary.skipped > 0 && (
              <span>{`· ${summary.skipped} skipped`}</span>
            )}
          </div>
        )}

        <ul {...ariaProps} className="flex flex-col gap-2">
          {results.map((result) => (
            <li key={result.id} role="listitem" className={testRowVariants({ status: result.status })}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={testStatusBadgeVariants({ status: result.status })}>
                    {result.status}
                  </span>
                  <span className={cn(testNameClass, 'truncate')}>{result.name}</span>
                </div>
                {result.durationMs !== undefined && (
                  <span className={testDurationClass}>{`${result.durationMs} ms`}</span>
                )}
              </div>

              {result.status === 'fail' && result.expected !== undefined && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className={testDiffBlockVariants({ side: 'expected' })}>
                    <span className="opacity-60 mr-1 select-none">expected</span>
                    {result.expected}
                  </div>
                  {result.actual !== undefined && (
                    <div className={testDiffBlockVariants({ side: 'actual' })}>
                      <span className="opacity-60 mr-1 select-none">actual</span>
                      {result.actual}
                    </div>
                  )}
                </div>
              )}

              {result.message && (
                <p className={testMessageClass}>{result.message}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  },
)

TestResults.displayName = 'TestResults'
