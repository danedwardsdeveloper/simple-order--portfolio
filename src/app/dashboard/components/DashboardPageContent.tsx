import { SignedInBreadCrumbs } from '@/components/BreadCrumbs'
import UnauthorisedLinks from '@/components/UnauthorisedLinks'
import type { UserData } from '@/types'
import type { UiContextData } from '@/types/definitions/contexts/ui'
import DemoWelcomeMessages from './DemoWelcomeMessages'
import OrdersSummaries from './OrdersSummaries'
import WelcomeMessages from './WelcomeMessages'

type Props = {
	demoMode: UiContextData['demoMode']
} & Pick<UserData, 'user' | 'ordersReceived'>

export default function DashboardPageContent(props: Props) {
	if (!props.user) return <UnauthorisedLinks />

	return (
		<>
			<SignedInBreadCrumbs businessName={props.user.businessName} currentPageTitle="Dashboard" isDemo={props.demoMode} />
			<h1>Dashboard</h1>
			{props.demoMode ? <DemoWelcomeMessages /> : <WelcomeMessages />}
			<br className="h-20" />
			<OrdersSummaries ordersReceived={props.ordersReceived} />
		</>
	)
}
