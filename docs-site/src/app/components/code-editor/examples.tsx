'use client'
import { useState } from 'react'
import { CodeEditor } from '@refraction-ui/react-code-editor'

interface CodeEditorExamplesProps { section: 'basic' }

const LANGUAGE_OPTIONS = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
]

export function CodeEditorExamples({ section }: CodeEditorExamplesProps) {
  const [code, setCode] = useState('console.log("Hello from Refraction UI!");\n\n// Try changing this code and clicking Run!')
  const [lang, setLang] = useState('javascript')
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
    setOutput([])
    
    // Simulate a small delay for "execution"
    setTimeout(() => {
      if (lang === 'javascript' || lang === 'typescript') {
        const logs: string[] = []
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.map(a => String(a)).join(' '))
        }
        
        try {
          // Simple evaluation for demo purposes
          const fn = new Function('console', code)
          fn(mockConsole)
          setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output).'])
        } catch (err: any) {
          setOutput([`Error: ${err.message}`])
        }
      } else {
        // Mock output for other languages
        if (code.includes('print(') || code.includes('System.out')) {
          const match = code.match(/["'](.*?)["']/)
          setOutput([match ? match[1] : 'Execution simulated successfully.'])
        } else {
          setOutput(['Execution not supported in browser for this language.'])
        }
      }
      setIsRunning(false)
    }, 400)
  }

  if (section === 'basic') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Language:</label>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary"
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isRunning ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Run Code
            </button>
          </div>
          
          <CodeEditor value={code} onChange={setCode} language={lang} />
          
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <h4 className="text-sm font-medium text-foreground">Execution Output:</h4>
            </div>
            <div className="rounded-lg bg-black p-4 font-mono text-sm text-green-400 min-h-[100px] shadow-inner">
              {output.length > 0 ? (
                output.map((line, i) => <div key={i} className="mb-1">{`> ${line}`}</div>)
              ) : (
                <span className="text-muted-foreground italic">Click "Run Code" to see output...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return null
}
