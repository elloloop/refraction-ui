'use client'
import { useState } from 'react'
import { ReactionBar } from '@refraction-ui/react-reaction-bar'
interface ReactionBarExamplesProps { section: 'basic' }
export function ReactionBarExamples({ section }: ReactionBarExamplesProps) {
  const [reactions, setReactions] = useState([
    { emoji: '👍', count: 5, userReacted: false },
    { emoji: '❤️', count: 3, userReacted: true },
    { emoji: '🎉', count: 1, userReacted: false },
  ])
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ReactionBar
          reactions={reactions}
          onToggle={(emoji) => {
            setReactions((prev) =>
              prev.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted }
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
