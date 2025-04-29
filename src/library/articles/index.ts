import { isArticleSlug, validateArticles } from '../utilities/public'
import { articlesData } from './data'

// Putting articles data in constants caused a circular dependency with logger

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
