import { AuthorisationCheck } from '@/components/AuthorisationCheck'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'

export default function HomePage() {
  return (
    <AuthorisationCheck fallback={<LandingPage />}>
      <Dashboard />
    </AuthorisationCheck>
  )
}
