'use client'

import type React from 'react'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

import logger from '@/library/logger'

import SplashScreen from '@/components/SplashScreen'

import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import { apiPaths } from '@/library/constants/apiPaths'
import type { FullBrowserSafeUser } from '@/types'

interface AuthorisationContextType {
	clientSafeUser: FullBrowserSafeUser | null
	setClientSafeUser: React.Dispatch<React.SetStateAction<FullBrowserSafeUser | null>>
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
export const AuthorisationProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const [clientSafeUser, setClientSafeUser] = useState<FullBrowserSafeUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const temporaryHardCodedDefaultVAT = 20

	useEffect(() => {
		const checkServerAuthorisation = async () => {
			try {
				const response = await fetch(apiPaths.authentication.verifyToken, {
					credentials: 'include',
				})
				if (response.ok) {
					// ToDo: Sort this logic out, as it returns 200 if there's no cookie (new user)
					const { user }: VerifyTokenGETresponse = await response.json()
					if (user) setClientSafeUser(user)
				}
			} catch (error) {
				logger.error('Authorisation check failed: ', error)
				setClientSafeUser(null)
			} finally {
				setIsLoading(false)
			}
		}
		checkServerAuthorisation()
	}, [])

	// type UserStateKey = keyof FullBrowserSafeUser;

	// function updateUserState<K extends UserStateKey>(
	// 	currentUser: FullBrowserSafeUser,
	// 	key: K,
	// 	newData: FullBrowserSafeUser[K]
	// ): FullBrowserSafeUser {
	// 	return {
	// 		...currentUser,
	// 		[key]: newData,
	// 	};
	// }

	return (
		<AuthorisationContext.Provider
			value={{
				clientSafeUser,
				setClientSafeUser,
				isLoading,
				temporaryHardCodedDefaultVAT,
			}}
		>
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
