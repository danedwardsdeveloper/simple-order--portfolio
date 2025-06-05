import { websiteCopy } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import { CalendarDaysIcon, ClockIcon, CreditCardIcon, PhoneXMarkIcon, TruckIcon, UserPlusIcon } from '@heroicons/react/24/solid'
import SectionHeader from './SectionHeader'

const features = [
	{
		name: 'Private',
		description:
			"The only people who can order from your store are your existing customers once you've invited them. It's not a public shop.",
		icon: UserPlusIcon,
	},
	{
		name: 'Phone-free ordering',
		description: 'Your regular customers can browse your products and place orders anytime without calling during your busy hours.',
		icon: PhoneXMarkIcon,
	},
	{
		name: 'No payment processing',
		description:
			'You handle payments as you always have - direct debit, bank transfer, or invoice. You keep all of your revenue - we just manage the orders.',
		icon: CreditCardIcon,
	},
	{
		name: 'Your delivery schedule',
		description: 'Set which days you deliver - Monday to Friday, weekends only, or a custom pattern.',
		icon: TruckIcon,
	},
	{
		name: 'Holiday management',
		description: "Block orders when you're closed or during busy periods. Customers automatically see when you're next accepting orders.",
		icon: CalendarDaysIcon,
	},
	{
		name: 'Order cut-off times',
		description: "Set how much notice you need, whether that's next-day delivery, 48 hours, or a week's notice.",
		icon: ClockIcon,
	},
]

const { title, subtitle, intro } = websiteCopy.features

export default function Features({ marginClasses }: { marginClasses: string }) {
	return (
		<div className={mergeClasses('mx-auto max-w-7xl px-6 lg:px-8', marginClasses)}>
			<SectionHeader title={title} subtitle={subtitle} intro={intro} />

			<dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
				{features.map((feature) => (
					<div key={feature.name} className="relative pl-9">
						<dt className="inline font-semibold">
							<feature.icon aria-hidden="true" className="absolute top-1 left-1 size-6 text-blue-600" />
							{feature.name}
						</dt>
						{' - '}
						<dd className="inline">{feature.description}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}
