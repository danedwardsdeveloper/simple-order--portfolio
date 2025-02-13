'use client'

import { useState } from 'react'

import { dataTestIdNames } from '@/library/constants/dataTestId'
import logger from '@/library/logger'

import { InviteCustomerPOSTbody, InviteCustomerPOSTresponse } from '@/app/api/invitations/create/route'
import { useAuthorisation } from '@/providers/authorisation'
import { apiPaths } from '@/types'

export default function InviteCustomerForm() {
  const { clientSafeUser, setClientSafeUser } = useAuthorisation()
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')

  if (!clientSafeUser || !clientSafeUser.merchantDetails || !clientSafeUser.emailConfirmed) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setResponseMessage('')
    setLoading(true)

    try {
      const body: InviteCustomerPOSTbody = {
        invitedEmail,
      }

      const response = await fetch(apiPaths.invitations.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const { message, browserSafeInvitationRecord }: InviteCustomerPOSTresponse = await response.json()

      logger.debug('Browser-safe invitation record: ', JSON.stringify(browserSafeInvitationRecord))

      // Figure out how to add the invitation record to the state...
      // if(browserSafeInvitationRecord) {
      //   setClientSafeUser({
      //     ...clientSafeUser,
      //     pendingCustomersAsMerchant: [browserSafeInvitationRecord],
      //   })
      // }
      setInvitedEmail('')
      setResponseMessage(message)
    } catch (error) {
      logger.errorUnknown(error, 'Error sending new invitation fetch request')
      setResponseMessage('Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInvitedEmail(event.target.value)
  }

  function ResponseMessage() {
    if (loading) {
      return <p data-test-id={dataTestIdNames.invite.loading}>Sending invitation...</p>
    } else {
      return responseMessage && <p data-test-id={dataTestIdNames.invite.response}>{responseMessage}</p>
    }
  }

  return (
    <div data-test-id={dataTestIdNames.invite.form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 max-w-sm p-3 border-2 my-4 rounded-xl border-blue-300 ">
        <h2>Invite a customer</h2>
        <div className="flex flex-col mb-4">
          <label htmlFor="invitedEmail" className="mb-1">
            Email
          </label>
          <input
            data-test-id={dataTestIdNames.invite.emailInput}
            id="invitedEmail"
            type="email"
            placeholder="customer@gmail.com"
            value={invitedEmail}
            onChange={handleEmailChange}
            required
          />
        </div>
        <button
          data-test-id={dataTestIdNames.invite.submitButton}
          type="submit"
          disabled={loading || !invitedEmail}
          className="button-primary">
          Send invitation
        </button>
        <ResponseMessage />
      </form>
    </div>
  )
}
