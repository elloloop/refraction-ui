// ============================================================
// Momento — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const features = [
  {
    title: 'Stories',
    description: 'Share moments that disappear after 24 hours. Add stickers, music, and polls.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: 'Reels',
    description: 'Create and discover short entertaining videos. Add effects, audio, and AR filters.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'Messages',
    description: 'Send photos, videos, and disappearing messages to friends and groups.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
  },
  {
    title: 'Explore',
    description: 'Discover new creators, trends, and content tailored to your interests.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
]

export const stories = [
  { name: 'Your Story', avatar: 'You', isOwn: true, seen: false },
  { name: 'sophia_art', avatar: 'SA', isOwn: false, seen: false },
  { name: 'mike.travels', avatar: 'MT', isOwn: false, seen: false },
  { name: 'cooking_with_j', avatar: 'CJ', isOwn: false, seen: false },
  { name: 'fit.emma', avatar: 'FE', isOwn: false, seen: true },
  { name: 'alex.dev', avatar: 'AD', isOwn: false, seen: false },
  { name: 'natalie.photo', avatar: 'NP', isOwn: false, seen: true },
  { name: 'james_music', avatar: 'JM', isOwn: false, seen: true },
]

export const posts = [
  {
    id: 1,
    username: 'sophia_art',
    avatar: 'SA',
    imageColor: 'from-primary/80 to-primary',
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
    imageColor: 'from-accent to-primary/60',
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
    imageColor: 'from-primary to-accent',
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
    imageColor: 'from-primary/70 to-primary',
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
    imageColor: 'from-accent to-primary',
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
    imageColor: 'from-primary to-primary/60',
    imageAspect: 'aspect-[4/5]',
    likes: 7234,
    caption: 'Portrait session with @sophia_art. Natural light only. No retouching needed.',
    comments: 203,
    time: '12h',
    liked: true,
    saved: true,
  },
]

export const categories = ['For You', 'Travel', 'Architecture', 'Food', 'Art', 'Nature', 'Fashion', 'Music']

export const gridItems = [
  { color: 'from-primary to-primary/70', span: 'col-span-1 row-span-1' },
  { color: 'from-accent to-primary/60', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/80 to-primary', span: 'col-span-1 row-span-2' },
  { color: 'from-primary/60 to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-accent to-primary', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/70 to-primary', span: 'col-span-1 row-span-2' },
  { color: 'from-primary/50 to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-primary/60', span: 'col-span-1 row-span-1' },
  { color: 'from-accent to-primary/70', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/80 to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-primary/50', span: 'col-span-1 row-span-2' },
  { color: 'from-accent to-primary/80', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/70 to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-accent to-primary/60', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/60 to-primary', span: 'col-span-1 row-span-2' },
  { color: 'from-primary/80 to-primary', span: 'col-span-1 row-span-1' },
  { color: 'from-accent to-primary', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-primary/70', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/60 to-accent', span: 'col-span-1 row-span-1' },
  { color: 'from-primary to-primary/50', span: 'col-span-1 row-span-1' },
  { color: 'from-primary/80 to-accent', span: 'col-span-1 row-span-2' },
  { color: 'from-accent to-primary/80', span: 'col-span-1 row-span-1' },
]

export const profileData = {
  username: 'alex.johnson',
  name: 'Alex Johnson',
  avatar: 'AJ',
  bio: 'Design engineer & photographer. Building beautiful interfaces.\nSan Francisco, CA',
  posts: 248,
  followers: 12400,
  following: 892,
}

export const tabs = ['Posts', 'Reels', 'Tagged']

export const postColors = [
  'from-primary to-primary/70',
  'from-primary/80 to-accent',
  'from-accent to-primary/60',
  'from-primary to-accent',
  'from-primary/70 to-primary',
  'from-primary/80 to-primary',
  'from-accent to-primary',
  'from-primary/60 to-accent',
  'from-primary/50 to-primary',
  'from-primary to-primary/60',
  'from-accent to-primary/70',
  'from-primary/80 to-accent',
  'from-primary to-primary/50',
  'from-accent to-primary/80',
  'from-primary/70 to-accent',
  'from-primary/60 to-primary',
  'from-accent to-primary/60',
  'from-primary to-primary/80',
]

export const storyHighlights = ['Travel', 'Food', 'Code', 'Design', 'Fitness']
