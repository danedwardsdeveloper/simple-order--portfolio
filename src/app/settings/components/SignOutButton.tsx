'use client'

import { useRouter } from 'next/navigation'

import { dataTestIdNames } from '@/library/constants/dataTestId'

import { useAuthorisation } from '@/providers/authorisation'
import { apiPaths } from '@/types'

export default function SignOutButton() {
  const { setClientSafeUser } = useAuthorisation()
  const router = useRouter()

  async function handleSignOut() {
    const response = await fetch(apiPaths.authentication.signOut, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      setClientSafeUser(null)
      // ToDo: Create notification
      router.push('/')
    } else {
      // ToDo
    }
  }

  return (
    <button data-test-id={dataTestIdNames.account.signOutButton} onClick={handleSignOut} className="button-secondary">
      Sign out
    </button>
  )
}
