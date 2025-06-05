import type { StaticImageData } from 'next/image'

export type CollectedImage = {
	src: StaticImageData
	alt: string
	slug: string
}

export type CollectedImageWithPaths = CollectedImage & {
	relative: string
	absolute: string
}
