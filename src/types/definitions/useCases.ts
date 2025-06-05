import type { CollectedImage } from './images'

export type UseCase = {
	featuredImage?: CollectedImage
	industry: string
	industries?: string // If plural version doesn't just add "s" on the end
	business: string
	activity: string
	people: string
}
