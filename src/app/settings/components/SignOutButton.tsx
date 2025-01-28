'use client'

import { SignOutPOSTresponse } from '@/app/api/authentication/sign-out/route'
import { useUi } from '@/providers/ui'
import { apiPaths } from '@/types'

export default async function SignOutButton() {
  const { setUser } = useUi()
  const router = 

  const response = await fetch(apiPaths.authentication.signOut, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    setUser(null)
  } else {
    const { message }: SignOutPOSTresponse = await response.json()
  }

  return <button className="button-secondary">Sign out</button>
}
