'use client'

import { customerOnlyOne, merchantAndCustomer, merchantOnlyOne } from '@/library/tempData/users'

import { useUi } from '@/providers/ui'

export default function TempoUiControlPanel() {
  const { uiSignedIn, setUiSignedIn, user, setUser, merchantMode, setMerchantMode } = useUi()

  function handleSignOut(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setUser(null)
    setUiSignedIn(false)
  }

  function handleSignInMerchantOnly(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setMerchantMode(true)
    setUser(merchantOnlyOne)
    setUiSignedIn(true)
  }

  function handleSignInCustomerOnly(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setMerchantMode(false)
    setUser(customerOnlyOne)
    setUiSignedIn(true)
  }

  function handleSignInBoth(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setUser(merchantAndCustomer)
    setMerchantMode(user?.lastUsedModeWasMerchant || true)
    setMerchantMode(true)
    setUiSignedIn(true)
  }

  function ModeText() {
    if (!uiSignedIn) return null
    return <p className="inline-block">{merchantMode ? 'Merchant mode' : 'Customer mode'}</p>
  }

  return (
    <>
      <div className="mb-2 flex flex-col gap-y-4 text-xl items-start p-4 rounded-xl border-2 border-blue-100">
        <h1 className="mb-0">Temporary UI control panel</h1>
        <div className="flex gap-x-4">
          <p className="inline-block">
            {'Signed in? '}
            <span className={uiSignedIn ? 'text-green-600' : 'text-red-600'}>
              {uiSignedIn ? 'True' : 'False'}
            </span>
          </p>
          <ModeText />
        </div>
        {uiSignedIn && (
          <button
            onClick={handleSignOut}
            className="rounded-lg px-2 py-0.5  border-2 transition-colors duration-300 bg-white hover:bg-neutral-100 active:bg-neutral-200  border-blue-300 hover:border-blue-400 active:border-blue-500"
          >
            Sign out
          </button>
        )}

        {!uiSignedIn && (
          <div className="flex gap-x-2">
            <button
              onClick={handleSignInMerchantOnly}
              className="rounded-lg px-2 py-0.5  border-2 transition-colors duration-300 bg-white hover:bg-neutral-100 active:bg-neutral-200  border-blue-300 hover:border-blue-400 active:border-blue-500"
            >
              Sign in merchant only
            </button>
            <button
              onClick={handleSignInCustomerOnly}
              className="rounded-lg px-2 py-0.5  border-2 transition-colors duration-300 bg-white hover:bg-neutral-100 active:bg-neutral-200  border-blue-300 hover:border-blue-400 active:border-blue-500"
            >
              Sign in customer only
            </button>
            <button
              onClick={handleSignInBoth}
              className="rounded-lg px-2 py-0.5  border-2 transition-colors duration-300 bg-white hover:bg-neutral-100 active:bg-neutral-200  border-blue-300 hover:border-blue-400 active:border-blue-500"
            >
              Sign in both
            </button>
          </div>
        )}
      </div>
    </>
  )
}
