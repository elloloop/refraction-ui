'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { instagramConfig } from '../../../theme-configs'

const profileData = {
  username: 'alex.johnson',
  name: 'Alex Johnson',
  avatar: 'AJ',
  bio: 'Design engineer & photographer. Building beautiful interfaces.\nSan Francisco, CA',
  posts: 248,
  followers: 12400,
  following: 892,
}

const tabs = ['Posts', 'Reels', 'Tagged']

const postColors = [
  'from-blue-400 to-indigo-600',
  'from-orange-400 to-red-500',
  'from-emerald-400 to-teal-600',
  'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-500',
  'from-fuchsia-400 to-pink-600',
  'from-lime-400 to-emerald-500',
  'from-red-400 to-pink-500',
  'from-sky-400 to-cyan-600',
  'from-yellow-400 to-amber-500',
  'from-indigo-400 to-violet-600',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-red-500',
  'from-green-400 to-emerald-600',
  'from-purple-400 to-indigo-500',
  'from-orange-500 to-amber-600',
]

const instaTheme = `:root {
  --primary: 340 82% 52%;
  --primary-foreground: 0 0% 100%;
  --avatar-radius: 9999px;
  --button-radius: 0.5rem;
  --card-radius: 0.5rem;
}`

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Posts')

  return (
    <div
      className="min-h-screen bg-background text-foreground pb-20"
      style={{
        '--primary': '340 82% 52%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '340 50% 95%',
        '--accent-foreground': '340 82% 42%',
      } as React.CSSProperties}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/examples/instagram/app" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <span className="font-semibold text-foreground">{profileData.username}</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-xl">
        {/* Profile header */}
        <div className="px-4 pt-4">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="p-[3px] rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 shrink-0">
              <div className="rounded-full bg-background p-[2px]">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {profileData.avatar}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{profileData.posts}</p>
                  <p className="text-xs text-muted-foreground">posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{formatCount(profileData.followers)}</p>
                  <p className="text-xs text-muted-foreground">followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{formatCount(profileData.following)}</p>
                  <p className="text-xs text-muted-foreground">following</p>
                </div>
              </div>
            </div>
          </div>

          {/* Name & bio */}
          <div className="mt-3">
            <p className="text-sm font-semibold text-foreground">{profileData.name}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line mt-0.5">{profileData.bio}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 rounded-[var(--button-radius)] bg-muted px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">
              Edit Profile
            </button>
            <button className="flex-1 rounded-[var(--button-radius)] bg-muted px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors">
              Share Profile
            </button>
          </div>

          {/* Story highlights */}
          <div className="flex gap-4 mt-4 overflow-x-auto py-2 no-scrollbar">
            {['Travel', 'Food', 'Code', 'Design', 'Fitness'].map((highlight) => (
              <div key={highlight} className="flex flex-col items-center gap-1 shrink-0">
                <div className="h-16 w-16 rounded-full border-2 border-border bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {highlight.charAt(0)}
                </div>
                <span className="text-[10px] text-muted-foreground">{highlight}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-16 w-16 rounded-full border-2 border-border bg-muted/50 flex items-center justify-center text-muted-foreground">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-[10px] text-muted-foreground">New</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border mt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors ${
                tab === activeTab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Post grid */}
        {activeTab === 'Posts' && (
          <div className="grid grid-cols-3 gap-0.5">
            {postColors.map((color, idx) => (
              <div
                key={idx}
                className={`aspect-square bg-gradient-to-br ${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              >
                <svg className="h-6 w-6 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Reels' && (
          <div className="grid grid-cols-3 gap-0.5">
            {postColors.slice(0, 9).map((color, idx) => (
              <div
                key={idx}
                className={`aspect-[9/16] bg-gradient-to-br ${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative`}
              >
                <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  {(Math.floor(Math.random() * 50) + 5)}K
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Tagged' && (
          <div className="grid grid-cols-3 gap-0.5">
            {postColors.slice(5, 11).map((color, idx) => (
              <div
                key={idx}
                className={`aspect-square bg-gradient-to-br ${color} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              >
                <svg className="h-6 w-6 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm z-40">
        <div className="mx-auto max-w-xl flex items-center justify-around py-2">
          <Link href="/examples/instagram/app" className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </Link>
          <Link href="/examples/instagram/app/explore" className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Link>
          <button className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
          <button className="p-2 text-muted-foreground">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </button>
          <Link href="/examples/instagram/app/profile" className="p-2">
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-foreground flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              AJ
            </div>
          </Link>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={instagramConfig} />
    </div>
  )
}
