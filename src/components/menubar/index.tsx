'use client'

import SignedInMenu from './SignedInMenu'
import SignedOutMenu from './SignedOutMenu'
import { useUi } from '@/providers/ui'

export default function MenuBar() {
  const { uiSignedIn } = useUi()
  return <>{uiSignedIn ? <SignedInMenu /> : <SignedOutMenu />}</>
}
