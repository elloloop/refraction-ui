'use client'

import * as React from 'react'
import {
  FloatingReactions,
  ReactionBurst,
  useFloatingReactions,
} from '@refraction-ui/react-floating-reactions'

interface FloatingReactionsExamplesProps {
  section: 'static' | 'lanes' | 'interactive'
}

export function FloatingReactionsExamples({ section }: FloatingReactionsExamplesProps) {
  if (section === 'static') {
    return <StaticExample />
  }

  if (section === 'lanes') {
    return <LanesExample />
  }

  if (section === 'interactive') {
    return <InteractiveExample />
  }

  return null
}

/** Shows a fixed set of reactions positioned in the overlay (no auto-expiry). */
function StaticExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
      <div className="relative w-full h-48 bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Meeting surface</span>
        <FloatingReactions
          reactions={[
            { id: '1', emoji: '👋', lane: 1 },
            { id: '2', emoji: '❤️', lane: 3 },
          ]}
          lanes={5}
        />
      </div>
    </div>
  )
}

/** Demonstrates the five lane positions side-by-side. */
function LanesExample() {
  const emojis = ['👋', '🎉', '❤️', '😂', '👏']
  return (
    <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
      <div className="relative w-full h-48 bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">5 lanes (0–4)</span>
        {emojis.map((emoji, lane) => (
          <ReactionBurst key={lane} emoji={emoji} lane={lane} lanes={5} />
        ))}
      </div>
    </div>
  )
}

/** Live demo — click buttons to emit reactions that auto-expire after 3 s. */
function InteractiveExample() {
  const { reactions, emit } = useFloatingReactions()

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="relative w-full h-48 bg-muted flex items-end justify-center pb-4">
        <span className="absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Reactions float here
        </span>
        <FloatingReactions reactions={reactions} lanes={5} />
        <div className="relative z-10 flex gap-2 pointer-events-auto">
          {['👋', '❤️', '🎉', '😂', '👏'].map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => emit(emoji, { lane: i })}
              className="text-2xl leading-none rounded-md hover:bg-background/50 p-1 transition-colors"
              aria-label={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
