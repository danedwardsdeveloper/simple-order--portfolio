import { UiProvider } from '@/providers/ui'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <UiProvider>{children}</UiProvider>
}
