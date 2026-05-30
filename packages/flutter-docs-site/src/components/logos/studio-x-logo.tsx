import React from 'react'

export function StudioXLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
      <span className="font-black italic tracking-tighter text-xl leading-none uppercase">StudioX</span>
    </div>
  )
}
