import type { CurrencyCode, DualPriority, LinkDetail } from '@/types'
import { currencyOptions } from './currencyOptions'
import { serviceConstraints } from './serviceConstraints'

export function getMetaDescription(currencyCode: CurrencyCode) {
	const pricingDetails = currencyOptions[currencyCode]

	return `An order management website for wholesalers at ${pricingDetails.formattedFull}/month. Reduce costs, save time, and eliminate phone call confusion - try the demo today.`
}

export const websiteCopy = {
	extras: {
		siteNameWithTag: 'Simple Order | Wholesale Order Management',
		selfContainedDescription:
			'Simple Order is an order management website for wholesalers and their customers so you can reduce costs, save time, and eliminate phone call confusion.',
	},
	linkDescriptions: {
		howItWorks: 'Learn more about our B2B order management website',
	},
	ctaSection: {
		title: 'Use Simple Order today to save time and money.',
		intro: `Join the wholesalers who are already saving hours each week by moving their orders online. Start your free ${serviceConstraints.trialLength}-day trial now – no credit card required, and you can be taking orders in minutes.`,
	},
	useCases: {
		title: 'Use cases',
		intro:
			'Simple Order works for any wholesale business that takes regular orders from the same customers. Save time, reduce errors, and let your customers order when it suits them.',
	},
	features: {
		title: 'Built for small wholesalers',
		subtitle: 'An online ordering system for your existing customers',
		intro:
			"Simple Order isn't an e-commerce store - it's for wholesalers who already know their customers and handle payments and deliveries themselves. Stop taking orders over the phone and let your regulars order online instead.",
	},
}

export const ctaOptions = {
	trial: {
		displayText: 'Start free trial',
		href: '/free-trial',
	},
	demo: {
		displayText: 'Start demo',
		href: '/demo/dashboard',
	},
	howItWorks: {
		displayText: 'How it works',
		href: '/articles/how-it-works',
	},
}

export const CTAs: Record<DualPriority, LinkDetail> = {
	primary: ctaOptions.trial,
	secondary: ctaOptions.demo,
}

export const newServiceCopy = [
	"We're a new service built specifically for small UK wholesalers. You'll be among our founding customers, helping shape a tool designed around how you actually work.",
]
