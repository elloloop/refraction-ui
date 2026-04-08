// ============================================================
// Cortex — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const capabilities = [
  {
    title: 'Answer Questions',
    description: 'Get instant, accurate answers across every topic from science to coding to creative writing.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  {
    title: 'Write Code',
    description: 'Generate, debug, and refactor code in any language. From algorithms to full-stack apps.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'Analyze Data',
    description: 'Upload datasets, get insights, build charts, and find patterns in your data effortlessly.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: 'Create Content',
    description: 'Draft emails, blog posts, marketing copy, and creative stories tailored to your voice.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
]

export const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic AI chat capabilities.',
    features: ['50 messages/day', 'Standard model', 'Text-only responses', 'Chat history (7 days)'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For professionals who need advanced AI features.',
    features: ['Unlimited messages', 'All advanced models', 'Code execution', 'File uploads', 'Priority access', 'Chat history (unlimited)'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams that need security, control, and scale.',
    features: ['Everything in Pro', 'SSO & SAML', 'Admin dashboard', 'API access', 'Custom models', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export const conversations = [
  { id: 1, title: 'Sieve of Eratosthenes implementation', date: 'Today' },
  { id: 2, title: 'React Server Components explained', date: 'Today' },
  { id: 3, title: 'Marketing copy for SaaS launch', date: 'Yesterday' },
  { id: 4, title: 'SQL query optimization tips', date: 'Yesterday' },
  { id: 5, title: 'TypeScript generics deep dive', date: 'Yesterday' },
  { id: 6, title: 'Design system color tokens', date: 'Mar 28' },
  { id: 7, title: 'Kubernetes pod scaling strategy', date: 'Mar 27' },
  { id: 8, title: 'Email template for client proposal', date: 'Mar 26' },
  { id: 9, title: 'Python data pipeline architecture', date: 'Mar 25' },
  { id: 10, title: 'CSS Grid vs Flexbox comparison', date: 'Mar 24' },
  { id: 11, title: 'GraphQL schema design patterns', date: 'Mar 22' },
  { id: 12, title: 'Unit testing best practices', date: 'Mar 20' },
]

export const chatMessages = [
  {
    role: 'user' as const,
    content: 'Can you explain React Server Components and when I should use them?',
  },
  {
    role: 'assistant' as const,
    content: `**React Server Components (RSC)** are a new paradigm that lets you render components on the server, sending only the HTML result to the client. Here's what you need to know:

## Key Benefits

1. **Zero client-side JavaScript** for server components — they never ship JS to the browser
2. **Direct database/API access** without building REST endpoints
3. **Automatic code splitting** — client components are lazy-loaded by default
4. **Streaming** — the server can progressively send rendered HTML

## When to Use Server Components

Use them when your component:
- Fetches data from a database or API
- Accesses server-only resources (filesystem, env variables)
- Renders large dependencies (markdown parsers, syntax highlighters)
- Doesn't need interactivity (no useState, onClick, etc.)

## When to Use Client Components

Use \`'use client'\` when your component:
- Uses React hooks (useState, useEffect, useContext)
- Needs browser APIs (localStorage, window, navigator)
- Has event handlers (onClick, onChange)
- Uses third-party libraries that depend on client-side state`,
  },
  {
    role: 'user' as const,
    content: 'Show me an example of a Server Component that fetches data.',
  },
  {
    role: 'assistant' as const,
    content: 'Here\'s a practical example of a Server Component that fetches data directly:',
    code: `// app/users/page.tsx — This is a Server Component by default
import { db } from '@/lib/database'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
}

export default async function UsersPage() {
  // Direct database query — no API route needed!
  const users = await db.query<User>(\`
    SELECT id, name, email, role
    FROM users
    ORDER BY created_at DESC
    LIMIT 50
  \`)

  return (
    <div className="space-y-4">
      <h1>Team Members</h1>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-muted">{user.email}</p>
      <span className="badge">{user.role}</span>
    </div>
  )
}`,
  },
  {
    role: 'user' as const,
    content: 'What about mixing Server and Client components together?',
  },
  {
    role: 'assistant' as const,
    content: `Great question! The key pattern is **composition** — Server Components can render Client Components as children, but not the other way around.

Here's the mental model:`,
    code: `// app/dashboard/page.tsx — Server Component
import { db } from '@/lib/database'
import { DashboardChart } from './chart'    // Client Component
import { FilterPanel } from './filters'      // Client Component

export default async function DashboardPage() {
  // This runs on the server
  const metrics = await db.getMetrics()

  return (
    <div>
      {/* Pass server data to client components as props */}
      <FilterPanel />
      <DashboardChart data={metrics} />

      {/* This static part stays on the server */}
      <footer>
        <p>Last updated: {new Date().toISOString()}</p>
      </footer>
    </div>
  )
}`,
    codeExtra: `// app/dashboard/chart.tsx — Client Component
'use client'

import { useState } from 'react'
import { BarChart } from 'recharts'

export function DashboardChart({ data }: { data: Metric[] }) {
  const [timeRange, setTimeRange] = useState('7d')

  const filtered = data.filter(d =>
    isWithinRange(d.date, timeRange)
  )

  return (
    <div>
      <select onChange={e => setTimeRange(e.target.value)}>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      <BarChart data={filtered} />
    </div>
  )
}`,
  },
]

export const models = ['Nova-4', 'Nova-4 Mini', 'Nova-3.5', 'Nova Code']

export const tabs = ['General', 'API Keys', 'Usage']
