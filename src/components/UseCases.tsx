import { websiteCopy } from '@/library/constants'
import { type ImageKey, imagesCollection } from '@/library/imagesCollection'
import { mergeClasses } from '@/library/utilities/public'
import type { CollectedImage } from '@/types'
import Image from 'next/image'
import SectionHeader from './SectionHeader'

type UseCase = {
	image: CollectedImage
	title: string
	description: string
}

function getPhoto(key: ImageKey, index = 0) {
	return imagesCollection[key][index]
}

// ToDo: combine these into my data
const useCases: UseCase[] = [
	{
		image: getPhoto('coffee'),
		title: 'Coffee roasters',
		description:
			'Supply cafes and restaurants with fresh beans. Let customers order their regular blends online instead of calling every week.',
	},
	{
		image: getPhoto('florist'),
		title: 'Florists',
		description:
			'Provide flowers to event planners, hotels and shops. Streamline weekly orders for regular arrangements and seasonal stock.',
	},
	{
		image: getPhoto('bakery', 1),
		title: 'Bakeries',
		description:
			'Supply bread, pastries, and cakes to cafes and restaurants. Reduce morning phone calls by letting customers place orders online.',
	},
	{
		image: getPhoto('autoParts'),
		title: 'Auto parts',
		description:
			'Distribute parts to garages and repair shops. Make it easy for mechanics to order their regular stock without phone calls.',
	},
	{
		image: getPhoto('cheeseMaker'),
		title: 'Cheese makers',
		description:
			'Supply artisan cheeses to delis and restaurants. Let customers browse your selection and place orders at their convenience.',
	},
	{
		image: getPhoto('furnitureManufacturer'),
		title: 'Furniture manufacturers',
		description: 'Provide custom furniture to interior designers and retailers. Simplify the ordering process for repeat customers.',
	},
	{
		image: getPhoto('fruitSeller'),
		title: 'Fruit and vegetable sellers',
		description:
			'Supply fresh produce to restaurants and shops. Enable customers to place their regular orders online for next-day delivery.',
	},
]

export default function UseCases({ marginClasses }: { marginClasses: string }) {
	const { title: sectionTitle, intro: sectionIntro } = websiteCopy.useCases

	return (
		<div className={mergeClasses('w-full px-6 py-8 sm:py-20 lg:px-8', marginClasses)}>
			<div className="max-w-6xl mx-auto">
				<SectionHeader title={sectionTitle} intro={sectionIntro} />

				<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
					{useCases.slice(0, useCases.length - (useCases.length % 3)).map(({ image: { src, alt }, title, description }) => (
						<li key={title}>
							<Image
								src={src} //
								alt={alt}
								// Mobile: full width minus 3rem padding (px-6 = 1.5rem each side), max 72rem container
								// Tablet: 2 columns with max 72rem container minus 3rem padding
								// Desktop: 3 columns with max 72rem container minus 4rem padding (lg:px-8 = 2rem each side)
								sizes="(max-width: 640px) min(calc(100vw - 3rem), 72rem), (max-width: 1024px) min(calc(50vw - 1.5rem), 36rem), min(calc(33vw - 1.33rem), 24rem)"
								placeholder="blur"
								className="w-full sm:max-w-96 rounded mb-2"
							/>
							<p className="font-medium mb-1">{title}</p>
							<p className="text-zinc-600">{description}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
