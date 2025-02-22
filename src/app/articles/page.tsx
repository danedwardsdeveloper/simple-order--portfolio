import Link from 'next/link'

import PageContainer from '@/components/PageContainer'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import type { Metadata } from 'next'
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
			<h1>Articles</h1>
			<div className="grid grid-cols-2 gap-y-24">
				{Object.keys(articlesData)
					.sort((a, b) => articlesData[b].date.getTime() - articlesData[a].date.getTime())
					.map((slug) => (
						<Link key={slug} href={`/articles/${slug}`} className="max-w-sm p-2 hover:bg-blue-50 rounded-lg transition-colors duration-300">
							<h2 className="text-xl font-medium mb-1">{articlesData[slug].displayTitle}</h2>
							<span className="text-zinc-600">{articlesData[slug].displayDescription}</span>
						</Link>
					))}
			</div>
		</PageContainer>
	)
}
