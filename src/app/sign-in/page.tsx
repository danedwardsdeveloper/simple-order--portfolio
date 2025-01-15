'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { allUsers } from '@/library/tempData/users'

import { useUi } from '@/providers/ui'

export default function SignInPage() {
  const [email, setEmail] = useState('both@gmail.com')
  const [password, setPassword] = useState('securePassword')
  const [error, setError] = useState('')
  const { setUiSignedIn, setUser } = useUi()
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const matchingUser = Object.values(allUsers).find(
      user => user.email.toLowerCase() === email.toLowerCase(),
    )

    if (!matchingUser) {
      setError('No account found with this email')
      return
    }

    if (matchingUser.password !== password) {
      setError('Incorrect password')
      return
    }

    setUser(matchingUser)
    setUiSignedIn(true)

    if (matchingUser.role === 'merchant' || matchingUser.role === 'both') {
      if (matchingUser.merchantProfile?.slug) {
        router.push(`/${matchingUser.merchantProfile.slug}`)
        return
      }
    }

    if (matchingUser.role === 'customer') {
      router.push('/orders')
      return
    }
    setError('Sorry something went wrong')
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
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

        <button type="submit" className="button inline-block max-w-sm w-full">
          Sign In
        </button>
      </form>
    </div>
  )
}
