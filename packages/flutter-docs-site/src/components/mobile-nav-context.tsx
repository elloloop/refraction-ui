'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileNavContextType {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

const MobileNavContext = createContext<MobileNavContextType>({
  isOpen: false,
  setIsOpen: () => {},
})

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  return useContext(MobileNavContext)
}
