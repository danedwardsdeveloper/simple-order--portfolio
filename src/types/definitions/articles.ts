import type { ReactNode } from 'react'
import type { ImageWithAlt } from './images'

export type ArticleSlug = 'how-it-works' | 'privacy-policy' | 'terms-of-service' | 'cookie-policy' | 'about' | 'gdpr-compliance'

export interface ArticleDetails {
	displayTitle: string
	slug: ArticleSlug
	metaTitle: string
	displayDescription: string
	metaDescription: string
	publishedAt: Date
	updatedAt?: Date
	utilityPage?: boolean
	featuredImage: ImageWithAlt
	category: ArticleCategory
	content: (string | ReactNode)[]
}

interface ArticleCategory {
	slug: ArticleCategorySlug
	display: string
}

export type ArticleCategorySlug = 'legal' | 'getting-started'

export const articleCategories = {
	legal: {
		slug: 'legal',
		display: 'Legal',
	},
	gettingStarted: {
		slug: 'getting-started',
		display: 'Getting Started',
	},
} as const

export type ArticleCategories = typeof articleCategories

export type ArticlesCollection = Record<ArticleSlug, ArticleDetails>
