'use client'

import { createContext, useContext, type ReactNode } from 'react'

type SettingContextType = {
  title: string
  isEditing: boolean
  isSubmitting: boolean
  hasChanges: boolean
  startEditing: () => void
  cancelEditing: () => void
  handleSave: () => void
}

const SettingContext = createContext<SettingContextType | null>(null)

export function useSetting() {
  const context = useContext(SettingContext)
  if (!context) {
    throw new Error('useSetting must be used within a SettingProvider')
  }
  return context
}

type SettingProviderProps = {
  children: ReactNode
  value: SettingContextType
}

export function SettingProvider({ children, value }: SettingProviderProps) {
  return (
    <SettingContext.Provider value={value}>
      {children}
    </SettingContext.Provider>
  )
}