'use client'

import { useUi } from '@/providers/ui'

export function AuthorisationCheck({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  const { uiSignedIn } = useUi()
  return uiSignedIn ? children : fallback
}
