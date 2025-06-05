import { allArticlesData } from '@/app/articles/data'
import logger from '@/library/logger'
import type { ArticlesCollection } from '@/types'

export function isArticleSlug(slug: string) {
	return Object.keys(allArticlesData).includes(slug)
}

/**
 * @description Logs image and metadata issues to the console but doesn't filter them
 */
export function validateArticles(allArticlesData: ArticlesCollection) {
	for (const [_slug, article] of Object.entries(allArticlesData)) {
		const { displayTitle, metaTitle, metaDescription } = article

		let errorMessage = undefined

		if (metaTitle.length < 40) errorMessage = 'metatitle too short'
		if (metaTitle.length > 65) errorMessage = 'metatitle too long'

		if (metaDescription.length < 70) errorMessage = 'metadescription too short'
		if (metaDescription.length > 155) errorMessage = 'metadescription too long'

		if (errorMessage) {
			logger.warn(`${displayTitle} ${errorMessage}`)
		}
	}

	return allArticlesData
}

const validatedArticles = validateArticles(allArticlesData)

export const sortedArticles = Object.keys(validatedArticles)
	.filter((article) => isArticleSlug(article))
	.filter((slug) => !validatedArticles[slug].programmatic)
	.sort((a, b) => {
		// Utility pages last, then sort by date
		if (validatedArticles[a].utilityPage && !validatedArticles[b].utilityPage) return 1
		if (!validatedArticles[a].utilityPage && validatedArticles[b].utilityPage) return -1

		const aTime = validatedArticles[a].updatedAt?.getTime() || validatedArticles[a].publishedAt.getTime()
		const bTime = validatedArticles[b].updatedAt?.getTime() || validatedArticles[b].publishedAt.getTime()

		return bTime - aTime
	})
