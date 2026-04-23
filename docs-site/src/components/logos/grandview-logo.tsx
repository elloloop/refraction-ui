import React from 'react'

export function GrandviewLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="M3 21h18" />
        <path d="M9 8h1" />
        <path d="M9 12h1" />
        <path d="M9 16h1" />
        <path d="M14 8h1" />
        <path d="M14 12h1" />
        <path d="M14 16h1" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      </svg>
      <span className="font-serif font-semibold tracking-wider text-lg leading-none">GRANDVIEW</span>
    </div>
  )
}
