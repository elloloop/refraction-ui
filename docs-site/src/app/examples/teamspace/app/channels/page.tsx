'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { teamspaceConfig } from '../../../theme-configs'
import { allChannels } from '../../config'

const teamspaceTheme = `:root {
  --primary: 220 72% 50%;
  --primary-foreground: 0 0% 100%;
  --sidebar-background: 220 40% 18%;
  --sidebar-foreground: 280 20% 85%;
}`

export default function ChannelBrowserPage() {
  return (
    <div
      className="h-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/examples/teamspace/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm text-muted-foreground">Back to chat</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Channel browser</h1>
            <p className="text-muted-foreground text-sm">{allChannels.length} channels available</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-4 py-2.5">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search channels..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Channel grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {allChannels.map((ch) => (
              <div
                key={ch.name}
                className="rounded-[var(--card-radius)] border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">#</span>
                    <span className="font-semibold text-sm text-foreground">{ch.name}</span>
                  </div>
                  {ch.isJoined ? (
                    <span className="rounded-[var(--badge-radius)] bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Joined
                    </span>
                  ) : (
                    <button className="rounded-[var(--button-radius)] border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                      Join
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{ch.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  {ch.members} members
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={teamspaceConfig} />
    </div>
  )
}
