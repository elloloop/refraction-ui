'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { cortexConfig } from '../../../theme-configs'

const tabs = ['General', 'API Keys', 'Usage']

const aiTheme = `:root {
  --primary: 160 84% 39%;
  --primary-foreground: 0 0% 100%;
  --sidebar-background: 210 15% 7%;
  --button-radius: 0.75rem;
  --card-radius: 0.75rem;
}`

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const [darkMode, setDarkMode] = useState(false)
  const [streaming, setStreaming] = useState(true)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [codeExecution, setCodeExecution] = useState(false)

  return (
    <div
      className="h-screen flex bg-background text-foreground overflow-hidden"
      style={{
        '--primary': '35 92% 50%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '35 50% 94%',
        '--accent-foreground': '35 92% 35%',
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <div className="w-64 bg-[hsl(210,15%,7%)] text-white/80 flex flex-col shrink-0">
        <div className="p-3">
          <Link href="/examples/cortex" className="flex items-center gap-2 px-3 py-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-full bg-[hsl(160,84%,39%)] flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">Cortex</span>
          </Link>
        </div>
        <div className="px-3 mb-3">
          <Link
            href="/examples/cortex/app"
            className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back to Chat
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <p className="px-2 pt-3 pb-1 text-xs font-medium text-white/30">Settings</p>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                tab === activeTab
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === activeTab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'General' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">General Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account preferences and chat behavior.</p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <input
                  type="text"
                  defaultValue="Alex Johnson"
                  className="w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  defaultValue="alex@example.com"
                  className="w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* Default Model */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Default Model</label>
                <select className="w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
                  <option>Nova-4</option>
                  <option>Nova-4 Mini</option>
                  <option>Nova-3.5</option>
                  <option>Nova Code</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                {[
                  { label: 'Dark Mode', desc: 'Use dark theme for the interface', value: darkMode, setter: setDarkMode },
                  { label: 'Streaming Responses', desc: 'Show responses as they are generated', value: streaming, setter: setStreaming },
                  { label: 'Conversation Memory', desc: 'Allow the model to remember context across chats', value: memoryEnabled, setter: setMemoryEnabled },
                  { label: 'Code Execution', desc: 'Allow running code in a sandboxed environment', value: codeExecution, setter: setCodeExecution },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-card p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{toggle.desc}</p>
                    </div>
                    <button
                      onClick={() => toggle.setter(!toggle.value)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        toggle.value ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          toggle.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button className="rounded-[var(--button-radius)] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'API Keys' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">API Keys</h2>
                <p className="text-sm text-muted-foreground">Manage your API keys for programmatic access.</p>
              </div>

              <div className="rounded-[var(--card-radius)] border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Your API Keys</span>
                    <button className="rounded-[var(--button-radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                      Create New Key
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { name: 'Production Key', key: 'sk-...Xk4m', created: 'Mar 15, 2024', lastUsed: '2 hours ago' },
                    { name: 'Development Key', key: 'sk-...9Bp2', created: 'Feb 8, 2024', lastUsed: '5 days ago' },
                    { name: 'CI/CD Pipeline', key: 'sk-...Tw7n', created: 'Jan 22, 2024', lastUsed: '1 day ago' },
                  ].map((apiKey) => (
                    <div key={apiKey.key} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{apiKey.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{apiKey.key}</code>
                          <span className="mx-2">|</span>
                          Created {apiKey.created}
                          <span className="mx-2">|</span>
                          Last used {apiKey.lastUsed}
                        </p>
                      </div>
                      <button className="text-xs text-destructive hover:underline">Revoke</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Usage' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Usage</h2>
                <p className="text-sm text-muted-foreground">Track your API and chat usage for the current billing period.</p>
              </div>

              {/* Usage stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Messages Sent', value: '2,847', change: '+12%', period: 'this month' },
                  { label: 'API Calls', value: '18,392', change: '+8%', period: 'this month' },
                  { label: 'Tokens Used', value: '4.2M', change: '+15%', period: 'this month' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[var(--card-radius)] border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-primary mt-1">{stat.change} {stat.period}</p>
                  </div>
                ))}
              </div>

              {/* Usage chart placeholder */}
              <div className="rounded-[var(--card-radius)] border border-border bg-card p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Daily Usage — Last 30 Days</h3>
                <div className="h-48 flex items-end gap-1">
                  {Array.from({ length: 30 }, (_, i) => {
                    const height = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 40
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`Day ${i + 1}`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Mar 7</span>
                  <span>Mar 14</span>
                  <span>Mar 21</span>
                  <span>Mar 28</span>
                  <span>Apr 6</span>
                </div>
              </div>

              {/* Plan info */}
              <div className="rounded-[var(--card-radius)] border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Current Plan</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Pro — $20/month</p>
                  </div>
                  <button className="rounded-[var(--button-radius)] border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Manage Plan
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Messages</span>
                      <span>2,847 / Unlimited</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>API Tokens</span>
                      <span>4.2M / 10M</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: '42%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={cortexConfig} />
    </div>
  )
}
