'use client'

import { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { useAuthorisation } from '@/providers/authorisation'
import { apiPaths } from '@/types'

export default function SignOutButton() {
  const { setClientUser } = useAuthorisation()

  async function handleSignOut() {
    const response = await fetch(apiPaths.authentication.signOut, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      setClientUser(null)
    } else {
      const { message }: SignOutPOSTresponse = await response.json()
    }
  }

  return (
    <button onClick={handleSignOut} className="button-secondary">
      Sign out
    </button>
  )
}
