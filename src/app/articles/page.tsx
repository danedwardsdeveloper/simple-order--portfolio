import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import PageContainer from '@/components/PageContainer'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { formatDate } from '@/library/utilities'
import clsx from 'clsx'
import type { Metadata } from 'next'
import Image from 'next/image'
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
			<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
				{Object.keys(articlesData)
					.sort((a, b) => {
						// Utility pages last, then sort by date
						if (articlesData[a].utilityPage && !articlesData[b].utilityPage) return 1
						if (!articlesData[a].utilityPage && articlesData[b].utilityPage) return -1
						return articlesData[b].date.getTime() - articlesData[a].date.getTime()
					})
					.map((slug, index) => (
						<article key={slug} className="flex flex-col items-start justify-between">
							<div className="relative w-full">
								<Image
									alt={articlesData[slug].metaDescription}
									src={articlesData[slug].featuredImage}
									priority={index < 2}
									className="aspect-video w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
								/>
								<div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
							</div>
							<div className="max-w-xl">
								<div className="mt-8 flex items-center gap-x-4 text-xs">
									<time dateTime={articlesData[slug].date.toString()} className="text-gray-500">
										{formatDate(articlesData[slug].date)}
									</time>
									<span
										// href={articlesData[slug].categorySlug}
										className={clsx(
											'relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600',
											// 'hover:bg-gray-100'
										)}
									>
										{articlesData[slug].categorySlug}
									</span>
								</div>
								<div className="group relative">
									<h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
										<a href={`/articles/${slug}`}>
											<span className="absolute inset-0" />
											{articlesData[slug].displayTitle}
										</a>
									</h3>
									<p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">{articlesData[slug].displayDescription}</p>
								</div>
							</div>
						</article>
					))}
			</div>
		</PageContainer>
	)
}
