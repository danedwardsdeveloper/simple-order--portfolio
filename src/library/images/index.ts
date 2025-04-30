import type { ImageWithAlt } from '@/types'
import autoParts from '../../../public/images/auto-parts.png'
import baristas from '../../../public/images/baristas.png'
import cheeseMaker from '../../../public/images/cheese-maker.png'
import florist from '../../../public/images/florist.png'
import fruitSeller from '../../../public/images/fruit-seller.png'
import furnitureManufacturer from '../../../public/images/furniture-manufacturer.png'
import defaultSocialImage from '../../../public/images/simple-order-wholesale-order-management-software-website.png'
import threeBakers from '../../../public/images/three-bakers.png'

type ImageKey = 'autoParts' | 'cheeseMaker' | 'baristas' | 'default' | 'florist' | 'fruitSeller' | 'furnitureManufacturer' | 'threeBakers'

type ImagesCollection = {
	[key in ImageKey]: ImageWithAlt
}

/**
 * 1,200 * 630px PNG
 */
export const metaImages: ImagesCollection = {
	autoParts: {
		src: autoParts,
		alt: 'Auto parts store worker in blue overalls holding a tool, with shelves of automotive fluids in the background.',
	},
	cheeseMaker: {
		src: cheeseMaker,
		alt: 'Cheesemaker in yellow apron gesturing toward wooden shelves of aging cheese wheels with price tags.',
	},
	baristas: {
		src: baristas,
		alt: 'Two baristas in tan aprons looking at a tablet while working with a coffee roaster.',
	},
	default: {
		src: defaultSocialImage,
		alt: 'Baker with curly hair and glasses smiling in front of bakery display cases filled with fresh bread and pastries.',
	},
	florist: {
		src: florist,
		alt: 'Florist in gray apron smiling with arms crossed, surrounded by various plants and orchids in a plant shop.',
	},
	fruitSeller: {
		src: fruitSeller,
		alt: 'Produce vendor in white apron holding a basket of oranges, with fruit display shelves behind her.',
	},
	furnitureManufacturer: {
		src: furnitureManufacturer,
		alt: 'Furniture craftsman smiling in a woodworking workshop with machinery and wood materials in the background.',
	},
	threeBakers: {
		src: threeBakers,
		alt: 'Three bakers in chef hats and aprons looking at a tablet while packaging freshly baked bread rolls.',
	},
}
