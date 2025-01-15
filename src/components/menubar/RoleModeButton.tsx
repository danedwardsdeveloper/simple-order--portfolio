'use client'

import { useRouter } from 'next/navigation'

import { useUi } from '@/providers/ui'

export default function RoleModeButton() {
  const { user, roleMode, toggleRoleMode } = useUi()
  const router = useRouter()
  const isMerchant = roleMode === 'merchant'

  const displayText = isMerchant ? 'Switch to merchant mode' : 'Switch to customer mode'
  const redirectDestination = isMerchant ? '/orders' : `${user?.merchantProfile?.slug}`

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    toggleRoleMode()

    router.push(redirectDestination)
  }

  return (
    <button onClick={handleClick} className="text-zinc-500 hover:text-zinc-400 active:text-zinc-300">
      {displayText}
    </button>
  )
}
