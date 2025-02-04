'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import logger from '@/library/logger'

import SplashScreen from '@/components/SplashScreen'

import { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import { apiPaths, ClientSafeUser } from '@/types'

interface AuthorisationContextType {
  clientSafeUser: ClientSafeUser | null
  setClientSafeUser: React.Dispatch<React.SetStateAction<ClientSafeUser | null>>
  isLoading: boolean
}

const AuthorisationContext = createContext<AuthorisationContextType>({
  clientSafeUser: null,
  setClientSafeUser: () => {},
  isLoading: true,
})

export const AuthorisationProvider = ({ children }: { children: ReactNode }) => {
  const [clientSafeUser, setClientSafeUser] = useState<ClientSafeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthorisation = async () => {
      try {
        const response = await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })
        if (response.ok) {
          const { user }: VerifyTokenGETresponse = await response.json()
          if (user) setClientSafeUser(user)
        }
      } catch (error) {
        logger.errorUnknown(error, 'Authorisation check failed: ')
        setClientSafeUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuthorisation()
  }, [])

  return (
    <AuthorisationContext.Provider value={{ clientSafeUser, setClientSafeUser, isLoading }}>
      <SplashScreen show={isLoading} />
      {children}
    </AuthorisationContext.Provider>
  )
}

export function useAuthorisation() {
  const context = useContext(AuthorisationContext)
  if (context === undefined) throw new Error('useUi must be used within a UiProvider')
  return context
}
