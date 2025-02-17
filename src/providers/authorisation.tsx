'use client'
import type { VerifyTokenGETresponse } from '@/app/api/authentication/verify-token/route'
import SplashScreen from '@/components/SplashScreen'
import { apiPaths } from '@/library/constants'
import logger from '@/library/logger'
import type { FullBrowserSafeUser } from '@/types'
import type React from 'react'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useNotifications } from './notifications'

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
	const { createNotification } = useNotifications()
	const [isLoading, setIsLoading] = useState(true)
	const temporaryHardCodedDefaultVAT = 20

	// biome-ignore lint/correctness/useExhaustiveDependencies: <run on mount only>
	useEffect(() => {
		const checkServerAuthorisation = async () => {
			try {
				const response = await fetch(apiPaths.authentication.verifyToken, {
					credentials: 'include',
				})
				if (response.ok) {
					// ToDo: Sort this logic out, as it returns 200 if there's no cookie (new user)
					const { fullBrowserSafeUser }: VerifyTokenGETresponse = await response.json()

					if (fullBrowserSafeUser) {
						setClientSafeUser(fullBrowserSafeUser)
						createNotification({
							level: 'success',
							title: 'Signed in',
							message: `Welcome back ${fullBrowserSafeUser.firstName}`,
						})
					}
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
