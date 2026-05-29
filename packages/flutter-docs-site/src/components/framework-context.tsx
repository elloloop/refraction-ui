'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Framework = 'flutter'

interface FrameworkContextType {
  framework: Framework
  setFramework: (framework: Framework) => void
}

const FrameworkContext = createContext<FrameworkContextType>({
  framework: 'flutter',
  setFramework: () => {},
})

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, setFrameworkState] = useState<Framework>('flutter')

  useEffect(() => {
    const saved = localStorage.getItem('rfr-framework') as Framework
    if (saved) setFrameworkState(saved)
  }, [])

  const setFramework = (f: Framework) => {
    setFrameworkState(f)
    localStorage.setItem('rfr-framework', f)
  }

  return (
    <FrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </FrameworkContext.Provider>
  )
}

export function useFramework() {
  return useContext(FrameworkContext)
}
