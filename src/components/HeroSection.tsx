import { serviceConstraints, websiteCopy } from '@/library/constants'
import { defaultImage } from '@/library/imagesCollection'
import { mergeClasses } from '@/library/utilities/public'
import Image from 'next/image'
import CtaPair from './CtaPair'
import type { PricingProps } from './Pricing'

export default function HeroSection(props: PricingProps) {
	return (
		<div className={mergeClasses('relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20', props.marginClasses)}>
			<div
				data-component="diagonal-graphic"
				aria-hidden="true"
				className="absolute inset-y-0 right-1/2 -z-diagonal-graphic -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96"
			/>
			<div className="mx-auto max-w-7xl px-6 py-8 sm:py-20 lg:px-8">
				<div className="flex flex-col mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8 md:text-right items-start md:items-center">
					<h1 className="max-w-2xl text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl lg:col-span-2 xl:col-auto">
						Order management made simple
					</h1>
					<div className="mt-6 max-w-2xl lg:mt-0 xl:col-end-1 xl:row-start-1 text-pretty md:text-balance text-lg font-medium text-zinc-600 sm:text-xl/8">
						<p className=" mb-2">
							An order management website for wholesalers so you can reduce costs, save time, and eliminate phone call confusion for just{' '}
							{props.pricingDetails.formattedFull} per month.
						</p>
						<p className=" mb-2">
							Start a free {serviceConstraints.trialLength}-day trial now and get started in minutes. No credit card required.
						</p>
						<div className="mt-10 flex items-center justify-center md:justify-end gap-x-6">
							<CtaPair />
						</div>
					</div>
					<Image
						priority
						alt={websiteCopy.extras.selfContainedDescription}
						src={defaultImage.src}
						className="mt-10 aspect-[6/5] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2"
					/>
				</div>
			</div>
			<div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
		</div>
	)
}
