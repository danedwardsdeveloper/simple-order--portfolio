'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import Spinner from '@/components/Spinner'

import { apiPaths } from '@/types'
import {
  ConfirmEmailPOSTbody,
  ConfirmEmailPOSTresponse,
  ConfirmEmailQueryParameters,
} from '@/types/api/authentication/email/confirm'

export default function Page() {
  const searchParams = useSearchParams()
  const token = searchParams.get(ConfirmEmailQueryParameters.token)

  const [message, setMessage] = useState('This is the default message')

  ConfirmEmailQueryParameters

  useEffect(() => {
    setIsLoading(true)
    const confirmEmail = async () => {
      const body: ConfirmEmailPOSTbody = {
        token,
      }
      const response = await fetch(apiPaths.authentication.email.confirm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const { message }: ConfirmEmailPOSTresponse = await response.json()
      setMessage(message)
      setIsLoading(false)
    }

    confirmEmail()
  }, [token])

  const [isLoading, setIsLoading] = useState(false)
  const heading = 'Confirm your email'

  function LoadingMessage() {
    return (
      <div className="flex gap-x-2">
        <Spinner />
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>{heading}</h1>
      <p>{isLoading ? <LoadingMessage /> : message}</p>
    </div>
  )
}
