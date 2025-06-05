import { sitePaths } from '@/library/constants/definitions/sitePaths'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { defaultImageWithPaths, getImagePath } from '@/library/imagesCollection'
import type { SitemapEntry } from '@/types'
import type { MetadataRoute } from 'next'
import urlJoin from 'url-join'
import { generateStaticParams as generateCurrencyParams } from './[currency]/layout'
import { allArticlesData } from './articles/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date()

	const homepage: SitemapEntry[] = [
		{
			url: dynamicBaseURL,
			lastModified: now,
			changeFrequency: 'monthly',
			priority: 1,
			images: [defaultImageWithPaths.absolute],
		},
	]

	const currencyPages: SitemapEntry[] = (await generateCurrencyParams()).map((staticParam) => ({
		url: `${dynamicBaseURL}/${staticParam.currency}`,
		lastModified: now,
		priority: 0.9,
		changeFrequency: 'monthly',
		images: [defaultImageWithPaths.absolute],
	}))

	const otherEntries: SitemapEntry[] = sitePaths
		.filter((entry) => !entry.hidden)
		.map((entry) => ({
			url: urlJoin(dynamicBaseURL, entry.path),
			lastModified: now,
			changeFrequency: 'monthly',
			priority: 0.9,
			images: [defaultImageWithPaths.absolute],
		}))

	const articleEntries: SitemapEntry[] = Object.values(allArticlesData).map((article) => ({
		url: `${dynamicBaseURL}/articles/${article.slug}`,
		lastModified: article.updatedAt || article.publishedAt,
		changeFrequency: 'weekly',
		priority: 0.8,
		images: [getImagePath(article.featuredImage).absolute],
	}))

	const maxURLs = 50_000
	const availableArticleSpaces = Math.max(0, maxURLs - otherEntries.length - currencyPages.length - homepage.length)

	const limitedArticleEntries = articleEntries
		.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
		.slice(0, availableArticleSpaces)

	const sortedEntries: SitemapEntry[] = [
		...homepage, //
		...currencyPages,
		...otherEntries,
		...limitedArticleEntries,
	]

	return sortedEntries
}
