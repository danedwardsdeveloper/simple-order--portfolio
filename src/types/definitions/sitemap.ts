export type ChangeFrequencies = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export type SitemapEntry = {
	url: string
	lastModified: string | Date
	changeFrequency: ChangeFrequencies
	priority: number
	images?: string[]
}
