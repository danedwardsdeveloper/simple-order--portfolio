import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import PageContainer from '@/components/PageContainer'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import type { Metadata } from 'next'
import Link from 'next/link'
import { articlesData } from './data'

export const metadata: Metadata = {
	title: 'Articles | Simple Order wholesale order management software website',
	alternates: {
		canonical: `${dynamicBaseURL}/articles`,
	},
}

export default function AllArticlesPage() {
	return (
		<PageContainer>
			<SignedOutBreadCrumbs currentPageTitle="Articles" />
			<h1>Articles</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-y-24">
				{Object.keys(articlesData)
					.sort((a, b) => {
						// Utility pages last, then sort by date
						if (articlesData[a].utilityPage && !articlesData[b].utilityPage) return 1
						if (!articlesData[a].utilityPage && articlesData[b].utilityPage) return -1
						return articlesData[b].date.getTime() - articlesData[a].date.getTime()
					})
					.map((slug) => (
						<Link
							key={slug}
							href={`/articles/${slug}`}
							className="max-w-sm md:p-2 hover:bg-blue-50 rounded-lg transition-colors duration-300"
						>
							<h2 className="text-xl font-medium mb-1">{articlesData[slug].displayTitle}</h2>
							<span className="text-zinc-600 hyphens-auto">{articlesData[slug].displayDescription}</span>
						</Link>
					))}
			</div>
		</PageContainer>
	)
}
