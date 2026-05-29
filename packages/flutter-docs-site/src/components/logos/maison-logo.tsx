import React from 'react'

export function MaisonLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props} className={props.className || ''}>
        <path d="M4 22h16" />
        <path d="M12 2v20" />
        <path d="M4 10l8-8 8 8" />
      </svg>
      <span className="font-serif font-light tracking-[0.2em] text-lg leading-none uppercase">Maison Eclat</span>
    </div>
  )
}
