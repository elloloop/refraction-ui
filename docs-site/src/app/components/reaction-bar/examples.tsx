'use client'
import { useState } from 'react'
import { ReactionBar } from '@refraction-ui/react-reaction-bar'
interface ReactionBarExamplesProps { section: 'basic' }
export function ReactionBarExamples({ section }: ReactionBarExamplesProps) {
  const [reactions, setReactions] = useState([
    { emoji: '👍', count: 5, reacted: false },
    { emoji: '❤️', count: 3, reacted: true },
    { emoji: '🎉', count: 1, reacted: false },
  ])
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ReactionBar
          reactions={reactions}
          onReact={(emoji) => {
            setReactions((prev) =>
              prev.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                  : r,
              ),
            )
          }}
        />
      </div>
    )
  }
  return null
}
