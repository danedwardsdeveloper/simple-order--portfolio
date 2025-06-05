'use client'
import MessageContainer from '@/components/MessageContainer'
import { useUi } from '@/components/providers/ui'
import Link from 'next/link'

export default function DemoWelcomeMessages() {
	const { setMerchantMode } = useUi()

	return (
		<>
			<MessageContainer borderColour={'border-blue-300'}>
				Welcome to the Simple Order demo!
				{/* <br />
				{`You're in `}
				{merchantMode ? 'merchant' : 'customer'} mode. */}
			</MessageContainer>
			<MessageContainer borderColour={'border-blue-300'}>
				<ul className="list-disc list-inside space-y-4">
					<li>
						<Link href="/demo/orders" className="link-primary underline underline-offset-2">
							View, download & print your orders
						</Link>
					</li>
					<li>
						<Link
							onClick={() => setMerchantMode(false)}
							href="/demo/orders/janes-bakery/new"
							className="link-primary underline underline-offset-2"
						>
							Place an order as a customer
						</Link>
					</li>
					<li>
						<Link onClick={() => setMerchantMode(true)} href="/demo/inventory" className="link-primary underline underline-offset-2">
							Add some items to your inventory
						</Link>
					</li>
					<li>
						See how easy it is to{' '}
						<Link onClick={() => setMerchantMode(true)} href="/demo/customers" className="link-primary underline underline-offset-2">
							invite a customer
						</Link>
					</li>
				</ul>
			</MessageContainer>
		</>
	)
}
