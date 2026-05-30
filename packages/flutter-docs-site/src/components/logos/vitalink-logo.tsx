import React from 'react'

export function VitalinkLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
      <span className="font-semibold tracking-tight text-lg leading-none text-blue-500">Vita<span className="text-foreground">Link</span></span>
    </div>
  )
}
