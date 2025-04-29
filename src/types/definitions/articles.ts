import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'

export interface ArticleDetails {
	displayTitle: string
	metaTitle: string
	displayDescription: string
	metaDescription: string
	publishedAt: Date
	updatedAt?: Date
	utilityPage?: boolean
	featuredImage: { src: StaticImageData; alt: string }
	categorySlug: 'Help' | 'Legal'
	content: (string | ReactNode)[]
}

export type ArticleSlug = 'how-it-works' | 'privacy-policy' | 'terms-of-service' | 'cookie-policy' | 'about' | 'gdpr-compliance'

export type ArticlesCollection = Record<ArticleSlug, ArticleDetails>
