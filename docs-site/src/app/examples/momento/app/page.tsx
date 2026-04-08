'use client'

import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { momentoConfig } from '../../theme-configs'

const stories = [
  { name: 'Your Story', avatar: 'You', isOwn: true, seen: false },
  { name: 'sophia_art', avatar: 'SA', isOwn: false, seen: false },
  { name: 'mike.travels', avatar: 'MT', isOwn: false, seen: false },
  { name: 'cooking_with_j', avatar: 'CJ', isOwn: false, seen: false },
  { name: 'fit.emma', avatar: 'FE', isOwn: false, seen: true },
  { name: 'alex.dev', avatar: 'AD', isOwn: false, seen: false },
  { name: 'natalie.photo', avatar: 'NP', isOwn: false, seen: true },
  { name: 'james_music', avatar: 'JM', isOwn: false, seen: true },
]

const posts = [
  {
    id: 1,
    username: 'sophia_art',
    avatar: 'SA',
    imageColor: 'from-amber-400 to-orange-600',
    imageAspect: 'aspect-square',
    likes: 2847,
    caption: 'Golden hour at the studio. New collection dropping this Friday.',
    comments: 48,
    time: '2h',
    liked: false,
    saved: false,
  },
  {
    id: 2,
    username: 'mike.travels',
    avatar: 'MT',
    imageColor: 'from-blue-400 to-cyan-600',
    imageAspect: 'aspect-[4/5]',
    likes: 5621,
    caption: 'Lost in the Swiss Alps. This planet never stops amazing me.',
    comments: 124,
    time: '4h',
    liked: true,
    saved: true,
  },
  {
    id: 3,
    username: 'cooking_with_j',
    avatar: 'CJ',
    imageColor: 'from-red-400 to-pink-600',
    imageAspect: 'aspect-square',
    likes: 1203,
    caption: 'Homemade pasta from scratch. Recipe in bio! #foodie #homemade #pasta',
    comments: 67,
    time: '5h',
    liked: false,
    saved: false,
  },
  {
    id: 4,
    username: 'alex.dev',
    avatar: 'AD',
    imageColor: 'from-violet-400 to-purple-700',
    imageAspect: 'aspect-[4/5]',
    likes: 892,
    caption: 'Late night coding session. Building something cool with React Server Components.',
    comments: 31,
    time: '7h',
    liked: true,
    saved: false,
  },
  {
    id: 5,
    username: 'fit.emma',
    avatar: 'FE',
    imageColor: 'from-emerald-400 to-teal-600',
    imageAspect: 'aspect-square',
    likes: 3456,
    caption: 'Morning run done. 10K in under 45 min - new personal best! Who else ran today?',
    comments: 89,
    time: '9h',
    liked: false,
    saved: false,
  },
  {
    id: 6,
    username: 'natalie.photo',
    avatar: 'NP',
    imageColor: 'from-rose-400 to-fuchsia-600',
    imageAspect: 'aspect-[4/5]',
    likes: 7234,
    caption: 'Portrait session with @sophia_art. Natural light only. No retouching needed.',
    comments: 203,
    time: '12h',
    liked: true,
    saved: true,
  },
]


function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    )
  }
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  )
}

export default function MomentoFeedPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        '--primary': '24 90% 55%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '24 50% 95%',
        '--accent-foreground': '24 90% 40%',
      } as React.CSSProperties}
    >
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-xl flex items-center justify-between px-4 py-3">
          <Link href="/examples/momento" className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            Momento
          </Link>
          <div className="flex items-center gap-4 text-foreground">
            <Link href="/examples/momento/app/explore">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </Link>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-xl">
        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4 no-scrollbar">
          {stories.map((story) => (
            <div key={story.name} className="flex flex-col items-center gap-1 shrink-0">
              <div className={`p-[3px] rounded-full ${
                story.seen
                  ? 'bg-muted'
                  : story.isOwn
                  ? 'bg-border'
                  : 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600'
              }`}>
                <div className="rounded-full bg-background p-[2px]">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground relative">
                    {story.avatar}
                    {story.isOwn && (
                      <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-2 border-background">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground max-w-[68px] truncate">
                {story.isOwn ? 'Your story' : story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6 pb-20">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-border pb-4">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {post.avatar}
                  </div>
                  <Link href="/examples/momento/app/profile" className="text-sm font-semibold text-foreground hover:opacity-70 transition-opacity">
                    {post.username}
                  </Link>
                </div>
                <button className="text-foreground">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className={`${post.imageAspect} bg-gradient-to-br ${post.imageColor} flex items-center justify-center`}>
                <svg className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-4">
                  <button className="hover:opacity-70 transition-opacity">
                    <HeartIcon filled={post.liked} />
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
                <button className="hover:opacity-70 transition-opacity">
                  {post.saved ? (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Likes */}
              <div className="px-4 mt-2">
                <p className="text-sm font-semibold text-foreground">{post.likes.toLocaleString()} likes</p>
              </div>

              {/* Caption */}
              <div className="px-4 mt-1">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{post.username}</span>{' '}
                  {post.caption}
                </p>
              </div>

              {/* Comments link */}
              <div className="px-4 mt-1">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  View all {post.comments} comments
                </button>
              </div>

              {/* Timestamp */}
              <div className="px-4 mt-1">
                <span className="text-[10px] uppercase text-muted-foreground tracking-wide">{post.time} ago</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm z-40">
        <div className="mx-auto max-w-xl flex items-center justify-around py-2">
          <Link href="/examples/momento/app" className="p-2 text-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </Link>
          <Link href="/examples/momento/app/explore" className="p-2 text-muted-foreground">
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
          <Link href="/examples/momento/app/profile" className="p-2">
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-foreground flex items-center justify-center text-[8px] font-bold text-muted-foreground">
              AJ
            </div>
          </Link>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={momentoConfig} />
    </div>
  )
}
