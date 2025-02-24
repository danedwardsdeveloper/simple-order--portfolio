'use client'

import { useUser } from '@/providers/user'
import SignedInMenu from './SignedInMenu'
import SignedOutMenu from './SignedOutMenu'

export default function MenuBar() {
	const { user } = useUser()
	return <>{user ? <SignedInMenu /> : <SignedOutMenu />}</>
}
