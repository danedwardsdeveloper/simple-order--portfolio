import { AuthorisationProvider } from '@/providers/authorisation'
import { UiProvider } from '@/providers/ui'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider>
      <AuthorisationProvider>{children}</AuthorisationProvider>
    </UiProvider>
  )
}
