import ArticleCard from '@/components/ArticleCard'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import PageContainer from '@/components/PageContainer'
import {} from '@/library/utilities/public'
import { sortedArticles } from '@/library/utilities/tsx'
import type { Metadata } from 'next'
import { allArticlesData } from './data'

export const metadata: Metadata = {
	title: 'Articles', // ...template
	alternates: {
		canonical: '/articles',
	},
}

export default function AllArticlesPage() {
	return (
		<PageContainer>
			<SignedOutBreadCrumbs currentPageTitle="Articles" />
			<h1>Articles</h1>
			<ul className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
				{sortedArticles.map((articleData, index) => {
					const { publishedAt, updatedAt, category, displayTitle, slug, displayDescription, featuredImage } = allArticlesData[articleData]

					return (
						<ArticleCard
							key={slug}
							priority={index < 2}
							displayTitle={displayTitle}
							slug={slug}
							displayDescription={displayDescription}
							publishedAt={publishedAt}
							featuredImage={featuredImage}
							category={category}
							updatedAt={updatedAt}
						/>
					)
				})}
			</ul>
		</PageContainer>
	)
}
