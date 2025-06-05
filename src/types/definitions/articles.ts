import type { ReactNode } from 'react'
import type { CollectedImage } from './images'

export interface ArticleDetails {
	programmatic?: boolean
	displayTitle: string
	slug: string
	metaTitle: string
	displayDescription: string
	metaDescription: string
	publishedAt: Date
	updatedAt?: Date
	utilityPage?: boolean
	featuredImage: CollectedImage
	category: ArticleCategory
	content: (string | ReactNode)[]
}

interface ArticleCategory {
	slug: ArticleCategorySlug
	display: string
}

export const articleCategories = {
	legal: {
		slug: 'legal',
		display: 'Legal',
	},
	gettingStarted: {
		slug: 'getting-started',
		display: 'Getting Started',
	},
	useCases: {
		slug: 'use-cases',
		display: 'Use cases',
	},
} as const

export type ArticleCategorySlug = (typeof articleCategories)[keyof typeof articleCategories]['slug']

export type ArticleCategories = typeof articleCategories
export type ArticlesCollection = Record<string, ArticleDetails>

export type ManualArticleSlug = 'cookie-policy' | 'gdpr-compliance' | 'how-it-works' | 'about' | 'privacy-policy' | 'terms-of-service'
export type ManualArticlesCollection = Record<ManualArticleSlug, ArticleDetails>
