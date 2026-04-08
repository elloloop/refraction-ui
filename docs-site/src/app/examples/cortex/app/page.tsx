'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeConfigPanel } from '@/components/theme-config-panel'
import { cortexConfig } from '../../theme-configs'
import { conversations, chatMessages, models } from '../config'

const aiTheme = `:root {
  --primary: 160 84% 39%;
  --primary-foreground: 0 0% 100%;
  --sidebar-background: 210 15% 7%;
  --sidebar-foreground: 210 10% 80%;
  --button-radius: 0.75rem;
  --card-radius: 0.75rem;
  --avatar-radius: 9999px;
}`

export default function AIChatAppPage() {
  const [selectedModel, setSelectedModel] = useState('Nova-4')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [inputText, setInputText] = useState('')

  return (
    <div
      className="h-screen flex bg-background text-foreground overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-64 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col shrink-0">
        <div className="p-3">
          <Link href="/examples/cortex" className="flex items-center gap-2 px-3 py-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">Cortex</span>
          </Link>
        </div>

        <div className="px-3 mb-3">
          <button className="w-full flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {conversations.map((conv, idx) => {
            const prevConv = conversations[idx - 1]
            const showDateHeader = !prevConv || prevConv.date !== conv.date
            return (
              <div key={conv.id}>
                {showDateHeader && (
                  <p className="px-2 pt-3 pb-1 text-xs font-medium text-white/30">{conv.date}</p>
                )}
                <button
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm truncate transition-colors ${
                    conv.id === 2
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {conv.title}
                </button>
              </div>
            )
          })}
        </div>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/examples/cortex/app/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {selectedModel}
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showModelDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-[var(--radius)] border border-border bg-card shadow-lg z-50">
                {models.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedModel(m); setShowModelDropdown(false) }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      m === selectedModel
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <button className="rounded-[var(--radius)] p-1.5 hover:bg-muted transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex items-start gap-3'}>
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                  </div>
                )}
                <div className={msg.role === 'user' ? 'max-w-lg' : 'flex-1'}>
                  {msg.role === 'user' ? (
                    <div className="rounded-[var(--radius)] bg-primary/10 px-4 py-3">
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-foreground leading-relaxed prose-sm">
                        {msg.content.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) {
                            return <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace('## ', '')}</h3>
                          }
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-semibold text-foreground">{line.replace(/\*\*/g, '')}</p>
                          }
                          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                            return <p key={i} className="ml-4 text-foreground/90">{line}</p>
                          }
                          if (line.startsWith('- ')) {
                            return <p key={i} className="ml-4 text-foreground/90">{line}</p>
                          }
                          if (line.startsWith('Use ')) {
                            return <p key={i} className="font-medium text-foreground mt-3">{line}</p>
                          }
                          if (line.trim() === '') return <br key={i} />
                          return <p key={i} className="text-foreground/90">{line}</p>
                        })}
                      </div>
                      {msg.code && (
                        <div className="rounded-[var(--radius)] border border-border bg-muted/70 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-muted/50">
                            <span className="text-xs text-muted-foreground font-mono">tsx</span>
                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Copy</button>
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-xs font-mono text-foreground">{msg.code}</code>
                          </pre>
                        </div>
                      )}
                      {msg.codeExtra && (
                        <div className="rounded-[var(--radius)] border border-border bg-muted/70 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-border px-3 py-1.5 bg-muted/50">
                            <span className="text-xs text-muted-foreground font-mono">tsx</span>
                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">Copy</button>
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-xs font-mono text-foreground">{msg.codeExtra}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border px-4 py-4 bg-background shrink-0">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[var(--radius)] border border-border bg-card shadow-sm">
              <div className="flex items-end gap-2 p-3">
                <button className="rounded-[var(--radius)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                  </svg>
                </button>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Send a message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
                />
                <button className="rounded-[var(--radius)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </button>
                <button className="rounded-full bg-primary p-2 text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Cortex may produce inaccurate information. Verify important facts independently.
            </p>
          </div>
        </div>
      </div>

      <ThemeConfigPanel defaultConfig={cortexConfig} />
    </div>
  )
}
