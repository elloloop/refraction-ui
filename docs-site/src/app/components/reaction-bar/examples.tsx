'use client'
import { useEffect, useRef, useState } from 'react'
import { ReactionBar, type Reaction } from '@refraction-ui/react-reaction-bar'
import { EmojiPicker } from '@refraction-ui/react-emoji-picker'

interface ReactionBarExamplesProps { section: 'basic' | 'work-chat' }

/** The current user's entry in a reaction's reactor list. */
const YOU = 'You'

/** Flip the current user's reaction, keeping the count and names in step. */
function toggled(reaction: Reaction): Reaction {
  const userReacted = !reaction.userReacted
  const others = (reaction.reactors ?? []).filter((name) => name !== YOU)
  return {
    ...reaction,
    userReacted,
    count: reaction.count + (userReacted ? 1 : -1),
    reactors: reaction.reactors && (userReacted ? [YOU, ...others] : others),
  }
}

function toggle(reactions: Reaction[], emoji: string): Reaction[] {
  return reactions
    .map((r) => (r.emoji === emoji ? toggled(r) : r))
    .filter((r) => r.count > 0)
}

function BasicExample() {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '👍', count: 5, userReacted: false },
    { emoji: '❤️', count: 3, userReacted: true },
    { emoji: '🎉', count: 1, userReacted: false },
  ])
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <ReactionBar
        reactions={reactions}
        onToggle={(emoji) => setReactions((prev) => toggle(prev, emoji))}
      />
    </div>
  )
}

function WorkChatExample() {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: '👍', label: 'Agree', count: 5, userReacted: true, reactors: [YOU, 'Dev Patel'] },
    { emoji: '👀', label: 'Looking', count: 2, userReacted: false, reactors: ['Ana', 'Sam'] },
    { emoji: '🎉', label: 'Celebrate', count: 1, userReacted: false, reactors: ['Kim'] },
    { emoji: '🚀', label: 'Ship it', count: 3, userReacted: false, reactors: ['Lee', 'Ana', 'Dev Patel'] },
    { emoji: '✅', label: 'Done', count: 1, userReacted: false, reactors: ['Someone who left'] },
  ])
  const [pickerOpen, setPickerOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const picker = useRef<HTMLDivElement>(null)

  // Opening the picker moves focus to its search; closing returns it to the
  // add button that opened it.
  useEffect(() => {
    if (pickerOpen) picker.current?.querySelector('input')?.focus()
  }, [pickerOpen])

  function closePicker() {
    setPickerOpen(false)
    trigger.current?.focus()
  }

  function add(emoji: string) {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji)
      if (existing) return existing.userReacted ? prev : toggle(prev, emoji)
      return [...prev, { emoji, count: 1, userReacted: true, reactors: [YOU] }]
    })
    closePicker()
  }

  return (
    <div
      data-testid="reaction-bar-work-chat-example"
      className="rounded-xl border border-border bg-card p-8 space-y-3"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && pickerOpen) closePicker()
      }}
    >
      <ReactionBar
        reactions={reactions}
        maxVisible={3}
        onToggle={(emoji) => setReactions((prev) => toggle(prev, emoji))}
        onAddReaction={(button) => {
          trigger.current = button
          setPickerOpen((open) => !open)
        }}
      />
      {pickerOpen && (
        <EmojiPicker ref={picker} stickerSets={[]} onSelect={(entry) => add(entry.emoji)} />
      )}
    </div>
  )
}

export function ReactionBarExamples({ section }: ReactionBarExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'work-chat') return <WorkChatExample />
  return null
}
