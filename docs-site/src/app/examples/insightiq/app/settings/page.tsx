'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { insightiqConfig } from '../../../theme-configs'
import { settingsTabs } from '../../config'
import { InsightIqLogo } from '@/components/logos';


const themeConfig = `:root {
  --primary: 250 50% 50%;
  --background: 0 0% 99%;
  --card: 0 0% 99%;
  --border: 240 6% 92%;
}`

export default function SaasSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-60 border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <span className="text-lg font-bold text-primary"><InsightIqLogo className="h-6 w-auto" /></span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {[
            { label: 'Dashboard', href: '/examples/insightiq/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
            { label: 'Analytics', href: '/examples/insightiq/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
            { label: 'Customers', href: '/examples/insightiq/app', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg> },
            { label: 'Settings', href: '/examples/insightiq/app/settings', active: true, icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1">
        <header className="sticky top-0 z-20 flex items-center border-b border-border bg-background/80 backdrop-blur-sm px-8 py-4">
          <h1 className="text-lg font-semibold">Settings</h1>
        </header>

        <div className="p-8 max-w-3xl">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.toLowerCase()
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="mt-8 space-y-8">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">SC</span>
                </div>
                <div>
                  <button className="rounded-[var(--button-radius)] border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Change Avatar
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah Chen"
                      className="w-full rounded-[var(--input-radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="sarah@metrix.io"
                      className="w-full rounded-[var(--input-radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select className="w-full rounded-[var(--input-radius)] border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                </div>
              </div>

              {/* Notification toggles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-[var(--card-radius)] border border-border p-4">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive email alerts for important updates</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-[var(--card-radius)] border border-border p-4">
                    <div>
                      <p className="text-sm font-medium">Marketing Emails</p>
                      <p className="text-xs text-muted-foreground">Product updates, tips, and offers</p>
                    </div>
                    <button
                      onClick={() => setMarketingEmails(!marketingEmails)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${marketingEmails ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${marketingEmails ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button className="rounded-[var(--button-radius)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
                <Link href="/examples/insightiq/app" className="rounded-[var(--button-radius)] border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Team Members (4)</h3>
                <button className="rounded-[var(--button-radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Invite Member</button>
              </div>
              {[
                { name: 'Sarah Chen', email: 'sarah@metrix.io', role: 'Admin', initials: 'SC' },
                { name: 'Marcus Johnson', email: 'marcus@metrix.io', role: 'Editor', initials: 'MJ' },
                { name: 'Elena Rodriguez', email: 'elena@metrix.io', role: 'Editor', initials: 'ER' },
                { name: 'James Wilson', email: 'james@metrix.io', role: 'Viewer', initials: 'JW' },
              ].map((m) => (
                <div key={m.email} className="flex items-center justify-between rounded-[var(--card-radius)] border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">{m.initials}</div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{m.role}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="mt-8 space-y-6">
              <div className="rounded-[var(--card-radius)] border border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Current Plan: Pro</h3>
                    <p className="text-xs text-muted-foreground mt-1">$79/month, billed monthly</p>
                  </div>
                  <button className="rounded-[var(--button-radius)] border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Change Plan</button>
                </div>
              </div>
              <div className="rounded-[var(--card-radius)] border border-border p-6">
                <h3 className="text-sm font-semibold mb-4">Payment Method</h3>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground">VISA</div>
                  <span className="text-sm">**** **** **** 4242</span>
                  <span className="text-xs text-muted-foreground">Expires 12/27</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { name: 'Teamspace', desc: 'Send alerts to team channels', connected: true },
                { name: 'DataPipe', desc: 'Import analytics data automatically', connected: true },
                { name: 'LeadFlow', desc: 'Sync customer data', connected: false },
                { name: 'MailForge', desc: 'Marketing automation sync', connected: false },
              ].map((i) => (
                <div key={i.name} className="flex items-center justify-between rounded-[var(--card-radius)] border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.desc}</p>
                  </div>
                  <button className={`rounded-[var(--button-radius)] px-3 py-1.5 text-xs font-medium ${i.connected ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'border border-border hover:bg-muted'}`}>
                    {i.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ThemeConfigPanel defaultConfig={insightiqConfig} />
    </div>
  )
}
