import { dynamicBaseURL, productionBaseURL } from '@/library/environment/publicVariables'
import type { CollectedImage, CollectedImageWithPaths } from '@/types'
import urlJoin from 'url-join'
import favicon from '../../../public/favicon/favicon-512.png'
import apiary from '../../../public/images/apiary.png'
import autoParts from '../../../public/images/auto-parts.png'
import baker from '../../../public/images/baker.png'
import baristas from '../../../public/images/baristas.png'
import cheeseMaker from '../../../public/images/cheese-maker.png'
import compost from '../../../public/images/compost.png'
import firewood from '../../../public/images/firewood.png'
import fruitSeller from '../../../public/images/fruit-seller.png'
import furnitureManufacturer from '../../../public/images/furniture-manufacturer.png'
import floristImage from '../../../public/images/simple-order-wholesale-order-management-software-website.png'
import threeBakers from '../../../public/images/three-bakers.png'
import type { UseCaseKey } from '../constants/tsx'

const _companyLogo: CollectedImageWithPaths = {
	src: favicon,
	alt: 'Simple Order wholesale order management website logo',
	slug: 'favicon-512',
	relative: '/favicon/favicon-512.png',
	absolute: `${productionBaseURL}/favicon/favicon-512.png`,
}

const imageKeys = [
	'bakery',
	'autoParts',
	'cheeseMaker',
	'coffee',
	'fruitSeller',
	'florist',
	'furnitureManufacturer',
	'apiary',
	'firewood',
	'compost',
] satisfies UseCaseKey[]

export type ImageKey = (typeof imageKeys)[number]

export const imagesCollection: {
	[key in ImageKey]: CollectedImage[]
} = {
	compost: [
		{
			src: compost,
			alt: 'Hands holding rich compost soil with earthworms for wholesale compost order management with Simple Order',
			slug: 'compost',
		},
	],
	// ToDo: include "wholesale {industry} order management" in all descriptions
	firewood: [
		{
			src: firewood,
			alt: 'Large pile of split firewood logs stacked outdoors on grass with green forest in background, showing seasoned hardwood ready for burning.',
			slug: 'firewood',
		},
	],
	apiary: [
		{
			src: apiary,
			alt: 'Smiling beekeeper in tan protective suit and mesh hat holding a honeycomb frame and jar of honey, crouched next to colorful blue and yellow beehives in a sunny outdoor apiary.',
			slug: 'apiary',
		},
	],
	autoParts: [
		{
			src: autoParts,
			alt: 'Auto parts store worker in blue overalls holding a tool, with shelves of automotive fluids in the background.',
			slug: 'auto-parts',
		},
	],
	cheeseMaker: [
		{
			src: cheeseMaker,
			alt: 'Cheesemaker in yellow apron gesturing toward wooden shelves of aging cheese wheels with price tags.',
			slug: 'cheese-maker',
		},
	],
	coffee: [
		{
			src: baristas,
			alt: 'Two baristas in tan aprons looking at a tablet while working with a coffee roaster.',
			slug: 'baristas',
		},
	],
	bakery: [
		{
			src: baker,
			alt: 'Baker with curly hair and glasses smiling in front of bakery display cases filled with fresh bread and pastries.',
			slug: 'baker',
		},
		{
			src: threeBakers,
			alt: 'Three bakers in chef hats and aprons looking at a tablet while packaging freshly baked bread rolls.',
			slug: 'three-bakers',
		},
	],
	florist: [
		{
			src: floristImage,
			alt: 'Florist in gray apron smiling with arms crossed, surrounded by various plants and orchids in a plant shop.',
			slug: 'simple-order-wholesale-order-management-software-website',
		},
	],
	fruitSeller: [
		{
			src: fruitSeller,
			alt: 'Produce vendor in white apron holding a basket of oranges, with fruit display shelves behind her.',
			slug: 'fruit-seller',
		},
	],
	furnitureManufacturer: [
		{
			src: furnitureManufacturer,
			alt: 'Furniture craftsman smiling in a woodworking workshop with machinery and wood materials in the background.',
			slug: 'furniture-manufacturer',
		},
	],
}

// Keep this out of utilities to avoid a circular dependency
export function getImagePath(image: CollectedImage) {
	const relative = `/images/${image.slug}.png`

	return {
		relative,
		absolute: urlJoin(dynamicBaseURL, relative),
	}
}

export const defaultImage = imagesCollection.florist[0]
export const defaultImageWithPaths: CollectedImageWithPaths = {
	...defaultImage,
	...getImagePath(defaultImage),
}
