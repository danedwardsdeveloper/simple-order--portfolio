'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import logger from '@/library/logger'

import SplashScreen from '@/components/SplashScreen'

import { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import { apiPaths, FullClientSafeUser } from '@/types'

interface AuthorisationContextType {
  clientSafeUser: FullClientSafeUser | null
  setClientSafeUser: React.Dispatch<React.SetStateAction<FullClientSafeUser | null>>
  isLoading: boolean
  temporaryHardCodedDefaultVAT: number
}

const AuthorisationContext = createContext<AuthorisationContextType>({
  clientSafeUser: null,
  setClientSafeUser: () => {},
  isLoading: true,
  temporaryHardCodedDefaultVAT: 20,
})

// ToDo: This is a mess
export const AuthorisationProvider = ({ children }: { children: ReactNode }) => {
  const [clientSafeUser, setClientSafeUser] = useState<FullClientSafeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const temporaryHardCodedDefaultVAT = 20

  useEffect(() => {
    const checkServerAuthorisation = async () => {
      try {
        const response = await fetch(apiPaths.authentication.verifyToken, { credentials: 'include' })
        if (response.ok) {
          // ToDo: Sort this logic out, as it returns 200 if there's no cookie (new user)
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
    checkServerAuthorisation()
  }, [])

  type UserStateKey = keyof FullClientSafeUser

  function updateUserState<K extends UserStateKey>(
    currentUser: FullClientSafeUser,
    key: K,
    newData: FullClientSafeUser[K],
  ): FullClientSafeUser {
    return {
      ...currentUser,
      [key]: newData,
    }
  }

  return (
    <AuthorisationContext.Provider value={{ clientSafeUser, setClientSafeUser, isLoading, temporaryHardCodedDefaultVAT }}>
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
