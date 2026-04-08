// ============================================================
// Teamspace — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const features = [
  {
    title: 'Channels',
    description: 'Organize conversations by topic, project, or team. Keep everything searchable.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
      </svg>
    ),
  },
  {
    title: 'Direct Messages',
    description: 'Private conversations with teammates. Share files, code, and ideas one-on-one.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    title: 'Integrations',
    description: 'Connect your favorite tools: project trackers, file storage, code repos, and 2,400+ more apps.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
      </svg>
    ),
  },
  {
    title: 'Search',
    description: 'Find any message, file, or conversation instantly across your entire workspace.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
]

export const channels = [
  { name: 'general', unread: 3 },
  { name: 'engineering', unread: 0 },
  { name: 'random', unread: 12 },
  { name: 'design', unread: 1 },
  { name: 'marketing', unread: 0 },
]

export const dms = [
  { name: 'Sarah Kim', status: 'online', avatar: 'SK' },
  { name: 'Mike Rodriguez', status: 'online', avatar: 'MR' },
  { name: 'Lisa Monroe', status: 'offline', avatar: 'LM' },
  { name: 'James Chen', status: 'away', avatar: 'JC' },
  { name: 'Ana Petrova', status: 'online', avatar: 'AP' },
]

export const messages = [
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

export const threadMessages = [
  { user: 'Mike Rodriguez', avatar: 'MR', time: '9:20 AM', text: 'This is a huge win for DX!' },
  { user: 'Lisa Monroe', avatar: 'LM', time: '9:25 AM', text: 'Can we apply the same approach to the staging pipeline?' },
  { user: 'Sarah Kim', avatar: 'SK', time: '9:30 AM', text: 'Absolutely! I\'ll create a ticket for it.' },
]

export const allChannels = [
  { name: 'general', description: 'Company-wide announcements and work-based matters', members: 156, isJoined: true },
  { name: 'engineering', description: 'Engineering team discussions, code reviews, and architecture decisions', members: 42, isJoined: true },
  { name: 'random', description: 'Non-work banter and water cooler conversation', members: 148, isJoined: true },
  { name: 'design', description: 'Design system updates, UI reviews, and creative discussions', members: 28, isJoined: true },
  { name: 'marketing', description: 'Campaign planning, content strategy, and brand discussions', members: 35, isJoined: true },
  { name: 'product', description: 'Product roadmap, feature requests, and user feedback', members: 52, isJoined: false },
  { name: 'frontend', description: 'React, CSS, TypeScript, and all things frontend', members: 31, isJoined: false },
  { name: 'backend', description: 'APIs, databases, infrastructure, and server-side discussions', members: 27, isJoined: false },
  { name: 'devops', description: 'CI/CD, monitoring, deployment, and infrastructure as code', members: 18, isJoined: false },
  { name: 'qa-testing', description: 'Quality assurance, test automation, and bug reports', members: 22, isJoined: false },
  { name: 'hiring', description: 'Open positions, referrals, and recruitment updates', members: 45, isJoined: false },
  { name: 'social-events', description: 'Team outings, celebrations, and fun activities', members: 120, isJoined: false },
  { name: 'book-club', description: 'Monthly book picks, discussions, and recommendations', members: 34, isJoined: false },
  { name: 'fitness', description: 'Workout tips, running groups, and health challenges', members: 56, isJoined: false },
  { name: 'pets', description: 'Share photos and stories of your furry (and not so furry) friends', members: 89, isJoined: false },
  { name: 'food-recipes', description: 'Cooking tips, restaurant reviews, and recipe sharing', members: 67, isJoined: false },
]

export const previewChannels = ['# general', '# engineering', '# random', '# design']

export const socialProofLogos = ['Acme Corp', 'Globex', 'Initech', 'Solaris', 'Apex Digital']

export const formatButtons = ['B', 'I', 'S', '</>']

export const previewMessages = [
                { name: 'Sarah K.', msg: 'Just deployed the new API endpoint!' },
                { name: 'Mike R.', msg: 'Nice! The tests are all passing.' },
                { name: 'Lisa M.', msg: 'Can we review the PR before EOD?' },
              ]
