'use client'

import React, { createContext, useContext, useState } from 'react'

import { ClientSafeUser } from '@/types'

interface UiContextType {
  uiSignedIn: boolean
  setUiSignedIn: (value: boolean) => void
  user: ClientSafeUser | null
  setUser: (user: ClientSafeUser | null) => void
  merchantMode: boolean
  setMerchantMode: (value: boolean) => void
  toggleMerchantMode: () => void
}

const UiContext = createContext<UiContextType | undefined>(undefined)

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientSafeUser | null>(null)
  const [uiSignedIn, setUiSignedIn] = useState(false)
  const [merchantMode, setMerchantMode] = useState(false)

  const toggleMerchantMode = () => {
    setMerchantMode(current => !current)
  }

  const value = {
    uiSignedIn,
    setUiSignedIn,
    user,
    setUser,
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
