import React from 'react'

export function TeamspaceLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <circle cx="9" cy="12" r="5" />
        <circle cx="15" cy="12" r="5" />
      </svg>
      <span className="font-medium tracking-tight text-lg leading-none">teamspace</span>
    </div>
  )
}
