'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import { testPasswords, testUsers } from '@/library/constants/testUsers'
import logger from '@/library/logger'

import { CheckboxIcon } from '@/components/Icons'

import { useAuthorisation } from '@/providers/authorisation'
import { apiPaths } from '@/types'
import { SignInPOSTbody, SignInPOSTresponse } from '@/types/api/authentication/sign-in'

export default function SignInPage() {
  const { setClientSafeUser } = useAuthorisation()
  const router = useRouter()
  const preFillForConvenience = false
  const [formData, setFormData] = useState<SignInPOSTbody>({
    email: preFillForConvenience ? testUsers.permanentTestUser.email : '',
    password: preFillForConvenience ? testPasswords.good : '',
    staySignedIn: false,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(apiPaths.authentication.signIn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          staySignedIn: formData.staySignedIn,
        } satisfies SignInPOSTbody),
      })

      const { message, foundUser }: SignInPOSTresponse = await response.json()

      if (!response.ok || message !== 'success') {
        setError('Sorry, something went wrong')
      }

      if (!foundUser) {
        setError('No account found with this email')
        return
      }

      setClientSafeUser(foundUser)
      router.push('/dashboard')
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
            data-test-id={dataTestIdNames.signIn.emailInput}
            id="email"
            type="email"
            value={formData.email}
            autoComplete="work email"
            onChange={event =>
              setFormData(prev => ({
                ...prev,
                email: event.target.value,
              }))
            }
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            data-test-id={dataTestIdNames.signIn.passwordInput}
            id="password"
            type="password"
            value={formData.password}
            autoComplete="current-password"
            onChange={event =>
              setFormData(prev => ({
                ...prev,
                password: event.target.value,
              }))
            }
            required
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex h-6 shrink-0 items-center">
            <div className="group grid size-4 grid-cols-1">
              <input
                data-test-id={dataTestIdNames.signIn.staySignedInCheckbox}
                id="stay-signed-in"
                name="stay-signed-in"
                type="checkbox"
                checked={formData.staySignedIn}
                onChange={event =>
                  setFormData(prev => ({
                    ...prev,
                    staySignedIn: event.target.checked,
                  }))
                }
              />
              <CheckboxIcon />
            </div>
          </div>
          <label htmlFor="stay-signed-in" className="block text-sm/6 text-gray-900">
            Stay signed in
          </label>
        </div>

        <button data-test-id={dataTestIdNames.signIn.submitButton} type="submit" className="button-primary inline-block w-full">
          Sign In
        </button>
      </form>
    </div>
  )
}
