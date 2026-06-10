'use client'

import { Payment } from '@refraction-ui/react-payment'

interface PaymentExamplesProps {
  section: 'basic' | 'disabled'
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const payButtonClass =
  'mt-2 inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90'

function PaymentForm() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1.5">
        <h3 className="text-xl font-semibold leading-none tracking-tight">Payment details</h3>
        <p className="text-sm text-muted-foreground">Enter your card to complete the purchase.</p>
      </div>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Card number
          <input className={inputClass} placeholder="4242 4242 4242 4242" />
        </label>
        <div className="flex gap-4">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
            Expiry
            <input className={inputClass} placeholder="MM / YY" />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
            CVC
            <input className={inputClass} placeholder="123" />
          </label>
        </div>
        <button type="button" className={payButtonClass}>
          Pay $49.00
        </button>
      </div>
    </>
  )
}

export function PaymentExamples({ section }: PaymentExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Payment>
          <PaymentForm />
        </Payment>
      </div>
    )
  }

  if (section === 'disabled') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Payment disabled>
          <PaymentForm />
        </Payment>
      </div>
    )
  }

  return null
}
