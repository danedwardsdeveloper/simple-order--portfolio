'use client'

import React, { createContext, useContext, useState } from 'react'

import { User } from '@/library/tempData/users'

interface UiContextType {
  uiSignedIn: boolean
  setUiSignedIn: (value: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  roleMode: 'merchant' | 'customer'
  setRoleMode: (value: 'merchant' | 'customer') => void
  toggleRoleMode: () => void
}

const UiContext = createContext<UiContextType | undefined>(undefined)

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [uiSignedIn, setUiSignedIn] = useState(false)
  const [roleMode, setRoleMode] = useState<'merchant' | 'customer'>('customer')

  const toggleRoleMode = () => {
    setRoleMode(current => (current === 'merchant' ? 'customer' : 'merchant'))
  }

  const value = {
    uiSignedIn,
    setUiSignedIn,
    user,
    setUser,
    roleMode,
    setRoleMode,
    toggleRoleMode,
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
