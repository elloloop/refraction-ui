'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { teamspaceConfig } from '../../theme-configs'

const channels = [
  { name: 'general', unread: 3 },
  { name: 'engineering', unread: 0 },
  { name: 'random', unread: 12 },
  { name: 'design', unread: 1 },
  { name: 'marketing', unread: 0 },
]

const dms = [
  { name: 'Sarah Kim', status: 'online', avatar: 'SK' },
  { name: 'Mike Rodriguez', status: 'online', avatar: 'MR' },
  { name: 'Lisa Monroe', status: 'offline', avatar: 'LM' },
  { name: 'James Chen', status: 'away', avatar: 'JC' },
  { name: 'Ana Petrova', status: 'online', avatar: 'AP' },
]

const messages = [
  {
    id: 1,
    user: 'Sarah Kim',
    avatar: 'SK',
    time: '9:15 AM',
    text: 'Good morning team! The new CI pipeline is live. Build times dropped from 8 min to under 3 min.',
    reactions: [{ emoji: '🎉', count: 5 }, { emoji: '🚀', count: 3 }],
    thread: 2,
  },
  {
    id: 2,
    user: 'Mike Rodriguez',
    avatar: 'MR',
    time: '9:18 AM',
    text: 'Incredible! How did you manage that?',
    reactions: [],
    thread: 0,
  },
  {
    id: 3,
    user: 'Sarah Kim',
    avatar: 'SK',
    time: '9:20 AM',
    text: 'Switched to incremental builds + parallel test sharding. Here\'s the config:',
    reactions: [],
    thread: 0,
  },
  {
    id: 4,
    user: 'Sarah Kim',
    avatar: 'SK',
    time: '9:20 AM',
    text: null,
    code: `# turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}`,
    reactions: [{ emoji: '👀', count: 2 }],
    thread: 0,
  },
  {
    id: 5,
    user: 'Lisa Monroe',
    avatar: 'LM',
    time: '9:32 AM',
    text: 'The design system updates are ready for review: https://figma.com/file/abc123',
    reactions: [{ emoji: '👍', count: 4 }],
    thread: 3,
  },
  {
    id: 6,
    user: 'James Chen',
    avatar: 'JC',
    time: '9:45 AM',
    text: 'Has anyone tested the new auth flow on mobile? I\'m seeing some weird behavior with the SSO redirect.',
    reactions: [],
    thread: 1,
  },
  {
    id: 7,
    user: 'Ana Petrova',
    avatar: 'AP',
    time: '9:48 AM',
    text: '@James Chen Yes, reproduced on iOS Safari. Looks like the callback URL is missing the port in dev mode. Quick fix:',
    reactions: [],
    thread: 0,
  },
  {
    id: 8,
    user: 'Ana Petrova',
    avatar: 'AP',
    time: '9:48 AM',
    text: null,
    code: `const callbackUrl = process.env.NODE_ENV === 'development'
  ? \`http://localhost:\${port}/auth/callback\`
  : \`\${process.env.NEXT_PUBLIC_URL}/auth/callback\`;`,
    reactions: [{ emoji: '🙏', count: 1 }],
    thread: 0,
  },
  {
    id: 9,
    user: 'Mike Rodriguez',
    avatar: 'MR',
    time: '10:02 AM',
    text: 'Reminder: Sprint retro at 2pm today. Please add your items to the board before then.',
    reactions: [{ emoji: '✅', count: 6 }],
    thread: 0,
  },
  {
    id: 10,
    user: 'Lisa Monroe',
    avatar: 'LM',
    time: '10:15 AM',
    text: 'Just published the updated component library docs. Check the new color token page!',
    reactions: [{ emoji: '🎨', count: 3 }, { emoji: '💯', count: 2 }],
    thread: 5,
  },
  {
    id: 11,
    user: 'James Chen',
    avatar: 'JC',
    time: '10:30 AM',
    text: 'Fixed the SSO issue. PR is up: #1247. Ana, could you review when you get a chance?',
    reactions: [{ emoji: '🔥', count: 2 }],
    thread: 0,
  },
  {
    id: 12,
    user: 'Sarah Kim',
    avatar: 'SK',
    time: '10:45 AM',
    text: 'Team standup notes are in the wiki. Big milestone: we hit 99.9% uptime this quarter!',
    reactions: [{ emoji: '🎉', count: 8 }, { emoji: '🏆', count: 4 }],
    thread: 0,
  },
]

const threadMessages = [
  { user: 'Mike Rodriguez', avatar: 'MR', time: '9:20 AM', text: 'This is a huge win for DX!' },
  { user: 'Lisa Monroe', avatar: 'LM', time: '9:25 AM', text: 'Can we apply the same approach to the staging pipeline?' },
  { user: 'Sarah Kim', avatar: 'SK', time: '9:30 AM', text: 'Absolutely! I\'ll create a ticket for it.' },
]

const slackTheme = `:root {
  --primary: 283 70% 45%;
  --primary-foreground: 0 0% 100%;
  --sidebar-background: 283 35% 18%;
  --sidebar-foreground: 280 20% 85%;
  --sidebar-accent: 283 30% 25%;
  --avatar-radius: 0.375rem;
  --button-radius: 0.375rem;
}`

export default function TeamspaceAppPage() {
  const [activeChannel, setActiveChannel] = useState('general')
  const [threadOpen, setThreadOpen] = useState(false)
  const [messageText, setMessageText] = useState('')

  return (
    <div
      className="h-screen flex flex-col bg-background text-foreground overflow-hidden"
      style={{
        '--primary': '283 70% 45%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '283 40% 95%',
        '--accent-foreground': '283 70% 35%',
      } as React.CSSProperties}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/examples/teamspace" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-[var(--radius)] bg-[hsl(283,70%,45%)] flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            </div>
            <span className="font-bold text-foreground text-sm">Teamspace</span>
          </Link>
        </div>
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Search Teamspace
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">5 members online</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-[hsl(283,35%,18%)] text-white/80 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-white text-sm">Acme Workspace</h2>
            <p className="text-xs text-white/50 mt-0.5">5 members</p>
          </div>

          <div className="p-3 space-y-4 flex-1">
            {/* Channels */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Channels</span>
                <Link href="/examples/teamspace/app/channels" className="text-white/40 hover:text-white/70 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-0.5">
                {channels.map((ch) => (
                  <button
                    key={ch.name}
                    onClick={() => setActiveChannel(ch.name)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-sm transition-colors ${
                      activeChannel === ch.name
                        ? 'bg-white/15 text-white'
                        : 'hover:bg-white/5 text-white/60'
                    }`}
                  >
                    <span className="truncate"># {ch.name}</span>
                    {ch.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[1.25rem] text-center font-medium">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* DMs */}
            <div>
              <div className="px-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Direct Messages</span>
              </div>
              <div className="space-y-0.5">
                {dms.map((dm) => (
                  <button
                    key={dm.name}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-white/5 text-white/60 transition-colors"
                  >
                    <span className="relative">
                      <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius)] bg-white/20 text-[10px] font-medium text-white">
                        {dm.avatar}
                      </span>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(283,35%,18%)] ${
                          dm.status === 'online'
                            ? 'bg-green-400'
                            : dm.status === 'away'
                            ? 'bg-yellow-400'
                            : 'bg-gray-500'
                        }`}
                      />
                    </span>
                    <span className="truncate">{dm.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-white/10">
            <Link href="/examples/teamspace/app/channels" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
              Browse Channels
            </Link>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Channel header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-background shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm"># {activeChannel}</span>
              <span className="text-xs text-muted-foreground border-l border-border pl-2 ml-1">
                Team-wide announcements and conversations
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1 text-xs">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                12
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1]
              const isGrouped = prevMsg && prevMsg.user === msg.user && prevMsg.time === msg.time
              return (
                <div
                  key={msg.id}
                  className={`group flex items-start gap-3 rounded-[var(--radius)] px-2 py-1 hover:bg-muted/50 transition-colors ${
                    isGrouped ? 'mt-0' : 'mt-3'
                  }`}
                >
                  {isGrouped ? (
                    <div className="w-9 shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-[var(--radius)] bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {msg.avatar}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!isGrouped && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-foreground">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                    )}
                    {msg.text && (
                      <p className="text-sm text-foreground/90 leading-relaxed">{msg.text}</p>
                    )}
                    {msg.code && (
                      <pre className="mt-1 rounded-[var(--radius)] border border-border bg-muted/70 p-3 overflow-x-auto">
                        <code className="text-xs font-mono text-foreground">{msg.code}</code>
                      </pre>
                    )}
                    {msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {msg.reactions.map((r) => (
                          <span
                            key={r.emoji}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs hover:bg-muted cursor-pointer transition-colors"
                          >
                            {r.emoji} <span className="text-muted-foreground">{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {msg.thread > 0 && (
                      <button
                        onClick={() => setThreadOpen(true)}
                        className="mt-1 text-xs text-primary hover:underline"
                      >
                        {msg.thread} {msg.thread === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message input */}
          <div className="border-t border-border px-4 py-3 bg-background shrink-0">
            <div className="rounded-[var(--radius)] border border-border bg-card">
              <div className="flex items-center gap-1 border-b border-border px-3 py-1.5">
                {['B', 'I', 'S', '</>'].map((btn) => (
                  <button key={btn} className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    {btn}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2 p-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Message #${activeChannel}`}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                    </svg>
                  </button>
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
                  </button>
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thread panel */}
        {threadOpen && (
          <div className="w-80 border-l border-border bg-background flex flex-col shrink-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2 shrink-0">
              <span className="font-semibold text-sm text-foreground">Thread</span>
              <button
                onClick={() => setThreadOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Original message */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-[var(--radius)] bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  SK
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-foreground">Sarah Kim</span>
                    <span className="text-xs text-muted-foreground">9:15 AM</span>
                  </div>
                  <p className="text-sm text-foreground/90">Good morning team! The new CI pipeline is live.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <p className="text-xs text-muted-foreground text-center">3 replies</p>
              {threadMessages.map((tm) => (
                <div key={tm.time} className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-[var(--radius)] bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                    {tm.avatar}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-xs text-foreground">{tm.user}</span>
                      <span className="text-[10px] text-muted-foreground">{tm.time}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{tm.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3 shrink-0">
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button className="text-primary hover:opacity-80 transition-opacity">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ThemeConfigPanel defaultConfig={teamspaceConfig} />
    </div>
  )
}
