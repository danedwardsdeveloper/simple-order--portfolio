'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { logUnknownErrorWithLabel } from '@/library/logger'

import SplashScreen from '@/components/SplashScreen'

import { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import { apiPaths, ClientSafeUser } from '@/types'

interface AuthorisationContextType {
  clientUser: ClientSafeUser | null
  setClientUser: React.Dispatch<React.SetStateAction<ClientSafeUser | null>>
  isLoading: boolean
}

const AuthorisationContext = createContext<AuthorisationContextType>({
  clientUser: null,
  setClientUser: () => {},
  isLoading: true,
})

export const AuthorisationProvider = ({ children }: { children: ReactNode }) => {
  const [clientUser, setClientUser] = useState<ClientSafeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthorisation = async () => {
      try {
        const response = await fetch(apiPaths.authentication.verifyToken, {
          credentials: 'include',
        })

        if (response.ok) {
          const { user, message }: VerifyTokenGETresponse = await response.json()
          if (user) {
            setClientUser(user)
          } else {
            // createNotification(message)
          }
        }
      } catch (error) {
        logUnknownErrorWithLabel('Authorisation check failed: ', error)
        setClientUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorisation()
  }, [])

  return (
    <AuthorisationContext.Provider value={{ clientUser, setClientUser, isLoading }}>
      <SplashScreen show={isLoading} />
      {children}
    </AuthorisationContext.Provider>
  )
}

export function useAuthorisation() {
  const context = useContext(AuthorisationContext)
  if (context === undefined) {
    throw new Error('useUi must be used within a UiProvider')
  }
  return context
}
