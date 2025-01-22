'use client'

import { useUi } from '@/providers/ui'

export default function RoleModeButton() {
  const { user, roleMode, toggleRoleMode } = useUi()

  if (!user) return null

  const isBothMerchantAndCustomer = user.role === 'both'

  if (!isBothMerchantAndCustomer) return null

  const displayText = roleMode === 'customer' ? 'Switch to merchant mode' : 'Switch to customer mode'

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    toggleRoleMode()
  }

  return (
    <button onClick={handleClick} className="text-sm text-zinc-500 hover:text-zinc-400 active:text-zinc-300">
      {displayText}
    </button>
  )
}
