import React from 'react'

export function ClearbankLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`text-foreground ${props.className || ''}`}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 3v18" />
        <path d="M12 8v8" />
        <path d="M17 12h-5" />
      </svg>
      <span className="font-semibold tracking-tight text-lg leading-none">Clearbank</span>
    </div>
  )
}
