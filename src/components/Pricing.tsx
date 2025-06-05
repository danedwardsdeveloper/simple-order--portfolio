import { ctaOptions, serviceConstraints } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import type { PricingDetails } from '@/types'
import { CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const includedFeatures = [
	`Up to ${serviceConstraints.maximumCustomers} customers`,
	`Up to ${serviceConstraints.maximumProducts} products`,
	'No phone interruptions',
	'Convenient for your customers',
]

// I'm recycling this type for convenience as it's the same as HeroSection
export type PricingProps = { pricingDetails: PricingDetails; marginClasses: string }

export default function Pricing({ pricingDetails, marginClasses }: PricingProps) {
	return (
		<div className={mergeClasses('mx-auto max-w-7xl px-6 lg:px-8', marginClasses)}>
			{/* Header section */}
			<div className="mx-auto max-w-4xl sm:text-center">
				<h2 className="text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-balance sm:text-6xl">Simple pricing</h2>
				<p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium text-gray-500 sm:text-xl leading-8">
					One simple plan at {pricingDetails.formattedFull} per month.
					<br />
					Start your {serviceConstraints.trialLength}-day free trial today - no credit card required.
				</p>
			</div>

			{/* Content box */}
			<div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
				<div className="p-8 sm:p-10 lg:flex-auto">
					<h3 className="text-3xl font-semibold tracking-tight text-gray-900">Monthly membership</h3>
					<p className="mt-6 text-base/7 text-gray-600 text-balance">
						Simple Order is a straightforward order management website for small businesses.
					</p>
					<div className="mt-10 flex items-center gap-x-4">
						<h4 className="flex-none leading-6 font-semibold text-blue-600">{`What's included`}</h4>
						<div className="h-px flex-auto bg-gray-100" />
					</div>
					<ul className="mt-8 grid grid-cols-1 gap-4 leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
						{includedFeatures.map((feature) => (
							<li key={feature} className="flex gap-x-3">
								<CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-blue-600" />
								{feature}
							</li>
						))}
					</ul>
				</div>

				{/* Inset box */}
				<div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
					<div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
						<div className="mx-auto max-w-xs px-8">
							<p className="mt-6 flex items-baseline justify-center gap-x-2">
								<span className="text-5xl font-semibold tracking-tight text-gray-900">{pricingDetails.formatted}</span>
								<span className="leading-6 font-semibold tracking-wide text-gray-600">{pricingDetails.upperCaseCode}/month</span>
							</p>
							<Link href={ctaOptions.trial.href} className="mt-10 block w-full button-primary py-2 text-xl shadow-md">
								{ctaOptions.trial.displayText}
							</Link>
							<p className="mt-6 text-gray-600">No credit card required</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
