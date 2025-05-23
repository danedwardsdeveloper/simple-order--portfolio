'use client'
import PageContainer from '@/components/PageContainer'
import { useDemoUser } from '@/components/providers/demo/user'
import { useUi } from '@/components/providers/ui'
import { useUser } from '@/components/providers/user'
import { demoCustomer } from '@/library/constants'
import { isProduction } from '@/library/environment/publicVariables'
import { notFound } from 'next/navigation'

export default function MenuBarTestPage() {
	const { user, setUser } = useUser()
	const { demoMode, toggleDemoMode, merchantMode } = useUi()
	const { demoUser } = useDemoUser()

	// Development-only page so I can quickly visualise how my menu looks in its various states.
	if (isProduction) return notFound()

	function toggleUser() {
		if (!user) {
			setUser(demoCustomer) // Using the demo user on the actual app user provider for convenience
		} else {
			setUser(null)
		}
	}

	const resolvedUser = demoMode ? demoUser : user

	return (
		<PageContainer>
			<h1>Menu bar test page</h1>
			<div className="flex flex-col gap-y-4 max-w-lg">
				<button type="button" onClick={toggleUser} className="button-primary block">
					Toggle user
				</button>
				<button type="button" onClick={toggleDemoMode} className="button-primary block">
					Toggle demo mode
				</button>
				<p>Demo mode enabled: {String(demoMode)}</p>
				<p>User: {user ? JSON.stringify(user) : String(user)}</p>
				<p>Merchant mode: {String(merchantMode)}</p>
				<p>Resolved user: {JSON.stringify(resolvedUser)}</p>
			</div>
		</PageContainer>
	)
}
