'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import logger from '@/library/logger'
import { users } from '@/library/tempData/users'

import { useUi } from '@/providers/ui'
import { apiPaths, SignInPOSTbody, SignInPOSTresponse } from '@/types'

export default function SignInPage() {
  const [email, setEmail] = useState('both@gmail.com')
  const [password, setPassword] = useState('securePassword')
  const [error, setError] = useState('')
  const { setUiSignedIn, setUser } = useUi()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(apiPaths.authentication.signIn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password } as SignInPOSTbody),
      })

      const { message, foundUser } = (await response.json()) satisfies SignInPOSTresponse

      if (!response.ok || message !== 'success') {
        setError('Sorry, something went wrong')
      }

      if (!foundUser) {
        setError('No account found with this email')
        return
      }

      setUser(foundUser)
      setUiSignedIn(true)
      router.push('/')
      return
    } catch (error) {
      logger.error(error)
      setError('Sorry something went wrong')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1>Sign In</h1>
      {error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
            className="w-full"
          />
        </div>

        <button type="submit" className="button-cta-primary inline-block w-full">
          Sign In
        </button>
      </form>
    </div>
  )
}
