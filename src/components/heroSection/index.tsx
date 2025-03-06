import { websiteCopy } from '@/library/constants'
import Image from 'next/image'
import Link from 'next/link'
import heroImage from './simple-order-wholesale-order-management-software-website.jpg'

export default function HeroSection() {
	return (
		<div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 pt-14">
			<div
				aria-hidden="true"
				className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96"
			/>
			<div className="mx-auto max-w-7xl px-6 py-8 sm:py-20 lg:px-8">
				<div className="flex flex-col mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8 md:text-right items-start">
					<h1 className="max-w-2xl text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl lg:col-span-2 xl:col-auto">
						{websiteCopy.heroSection.h1}
					</h1>
					<div className="mt-6 max-w-2xl lg:mt-0 xl:col-end-1 xl:row-start-1">
						{websiteCopy.heroSection.intro.map((paragraph) => (
							<p className="text-pretty text-lg font-medium text-gray-500 sm:text-xl/8 mb-2" key={paragraph}>
								{paragraph}
							</p>
						))}
						<div className="mt-10 flex items-center justify-center md:justify-end gap-x-6">
							<Link href={websiteCopy.CTAs.secondary.href} className="button-secondary text-lg">
								{websiteCopy.CTAs.secondary.displayText}
							</Link>
							<Link href={websiteCopy.CTAs.primary.href} className="button-primary text-lg">
								{websiteCopy.CTAs.primary.displayText}
							</Link>
						</div>
					</div>
					<Image
						priority
						alt={websiteCopy.extras.selfContainedDescription}
						src={heroImage}
						className="mt-10 aspect-[6/5] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2"
					/>
				</div>
			</div>
			<div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
		</div>
	)
}
