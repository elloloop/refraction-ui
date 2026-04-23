import React from 'react'

export function InsightIqLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
      <span className="font-bold tracking-tight text-lg leading-none">Insight<span className="text-primary">IQ</span></span>
    </div>
  )
}
