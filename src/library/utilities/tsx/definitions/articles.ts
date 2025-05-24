import { articlesData } from '@/app/articles/data'
import logger from '@/library/logger'
import type { ArticleSlug, ArticlesCollection } from '@/types'

export function isArticleSlug(slug: string): slug is ArticleSlug {
	return Object.keys(articlesData).includes(slug as ArticleSlug)
}

/**
 * @description Logs image and metadata issues to the console but doesn't filter them
 */
export function validateArticles(articlesData: ArticlesCollection) {
	for (const [_slug, article] of Object.entries(articlesData)) {
		const {
			displayTitle,
			metaTitle,
			metaDescription,
			featuredImage: { src },
		} = article

		let errorMessage = undefined

		if (metaTitle.length < 40) errorMessage = 'metatitle too short'
		if (metaTitle.length > 65) errorMessage = 'metatitle too long'

		if (metaDescription.length < 70) errorMessage = 'metadescription too short'
		if (metaDescription.length > 155) errorMessage = 'metadescription too long'

		if (src.height !== 630) {
			errorMessage = `image height is ${src.height}, expected 630`
		}

		if (src.width !== 1200) {
			errorMessage = `image width is ${src.width}, expected 1200`
		}

		if (errorMessage) {
			logger.warn(`${displayTitle} ${errorMessage}`)
		}
	}

	return articlesData
}

const validatedArticles = validateArticles(articlesData)

export const sortedArticles = Object.keys(validatedArticles)
	.filter((article) => isArticleSlug(article))
	.sort((a, b) => {
		// Utility pages last, then sort by date
		if (validatedArticles[a].utilityPage && !validatedArticles[b].utilityPage) return 1
		if (!validatedArticles[a].utilityPage && validatedArticles[b].utilityPage) return -1

		const aTime = validatedArticles[a].updatedAt?.getTime() || validatedArticles[a].publishedAt.getTime()
		const bTime = validatedArticles[b].updatedAt?.getTime() || validatedArticles[b].publishedAt.getTime()

		return bTime - aTime
	})
