'use client'

import React, { createContext, useContext, useState } from 'react'

interface UiContextType {
  merchantMode: boolean
  setMerchantMode: (value: boolean) => void
  toggleMerchantMode: () => void
}

const UiContext = createContext<UiContextType | undefined>(undefined)

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [merchantMode, setMerchantMode] = useState(false)

  const toggleMerchantMode = () => {
    setMerchantMode(current => !current)
  }

  const value = {
    merchantMode,
    setMerchantMode,
    toggleMerchantMode,
  }

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const context = useContext(UiContext)
  if (context === undefined) {
    throw new Error('useUi must be used within a UiProvider')
  }
  return context
}
