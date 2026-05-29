import React from 'react'

export function VerveLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="m13 2-8 11h9l-3 9 9-12h-8z" />
      </svg>
      <span className="font-black italic tracking-tight text-xl leading-none">VERVE</span>
    </div>
  )
}
