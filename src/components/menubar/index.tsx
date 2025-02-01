'use client'

import SignedInMenu from './SignedInMenu'
import SignedOutMenu from './SignedOutMenu'
import { useAuthorisation } from '@/providers/authorisation'

export default function MenuBar() {
  const { clientUser } = useAuthorisation()
  return <>{clientUser ? <SignedInMenu /> : <SignedOutMenu />}</>
}
