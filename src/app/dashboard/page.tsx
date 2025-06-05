'use client'
import { useUser } from '@/components/providers/user'
import DashboardPageContent from './components/DashboardPageContent'

export default function DashboardPage() {
	const { user, ordersReceived } = useUser()

	return <DashboardPageContent demoMode={false} user={user} ordersReceived={ordersReceived} />
}
