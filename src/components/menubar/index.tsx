'use client'

import { useAuthorisation } from '@/providers/authorisation'
import SignedInMenu from './SignedInMenu'
import SignedOutMenu from './SignedOutMenu'

export default function MenuBar() {
	const { clientSafeUser } = useAuthorisation()
	return <>{clientSafeUser ? <SignedInMenu /> : <SignedOutMenu />}</>
}
