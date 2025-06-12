'use client'
import DashboardPageContent from '@/app/dashboard/components/DashboardPageContent'
import { useDemoUser } from '@/components/providers/demo/user'

export default function DemoDashboard() {
	const { resolvedUser, ordersReceived } = useDemoUser()

	return (
		<DashboardPageContent
			user={resolvedUser} //
			ordersReceived={ordersReceived}
			demoMode={true}
		/>
	)
}
