'use client'

import * as React from 'react'
import { Timeline } from '@refraction-ui/react-timeline'
import type { TimelineItemData } from '@refraction-ui/react-timeline'

interface TimelineExamplesProps {
  section: 'vertical' | 'horizontal' | 'statuses'
}

const meetingItems: TimelineItemData[] = [
  { id: '1', title: 'Stand-up', time: '9:00 AM', description: 'Daily team sync.', status: 'done' },
  { id: '2', title: 'Design review', time: '10:30 AM', description: 'Review new mockups.', status: 'current' },
  { id: '3', title: 'Engineering sync', time: '2:00 PM', status: 'upcoming' },
  { id: '4', title: 'Retro', time: '4:00 PM', status: 'upcoming' },
]

const historyItems: TimelineItemData[] = [
  { id: '1', title: 'Account created', time: 'Jan 3' },
  { id: '2', title: 'Profile completed', time: 'Jan 5' },
  { id: '3', title: 'First project', time: 'Jan 10' },
  { id: '4', title: 'Invited teammate', time: 'Jan 14' },
]

const statusItems: TimelineItemData[] = [
  { id: '1', title: 'Requirements gathered', status: 'done', description: 'All stakeholders aligned.' },
  { id: '2', title: 'Design phase', status: 'done', description: 'Mockups approved.' },
  { id: '3', title: 'Implementation', status: 'current', description: 'In progress — 60% complete.' },
  { id: '4', title: 'QA & testing', status: 'upcoming' },
  { id: '5', title: 'Release', status: 'upcoming' },
]

export function TimelineExamples({ section }: TimelineExamplesProps) {
  if (section === 'vertical') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h3 className="mb-6 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Today
        </h3>
        <Timeline items={meetingItems} orientation="vertical" />
      </div>
    )
  }

  if (section === 'horizontal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 overflow-x-auto">
        <Timeline items={historyItems} orientation="horizontal" />
      </div>
    )
  }

  if (section === 'statuses') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Timeline items={statusItems} orientation="vertical" />
      </div>
    )
  }

  return null
}
