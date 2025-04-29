import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import PageContainer from '@/components/PageContainer'
import { sortedArticles } from '@/library/articles'
import { articlesData } from '@/library/articles/data'
import { formatDate, mergeClasses } from '@/library/utilities/public'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

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
			<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
				{sortedArticles.map((slug, index) => {
					const {
						publishedAt,
						updatedAt,
						categorySlug,
						displayTitle,
						displayDescription,
						featuredImage: { src, alt },
					} = articlesData[slug]

					return (
						<Link
							key={slug}
							href={`/articles/${slug}`}
							className="flex flex-col items-start group hover:opacity-80 duration-300 transition-opacity"
						>
							<div className="relative w-full">
								<Image alt={alt} src={src} priority={index < 2} className="w-full rounded-md bg-gray-100 object-cover" />
								<div className="absolute inset-0 rounded-md ring-1 ring-inset ring-gray-900/10" />
							</div>
							<div className="max-w-xl">
								<div className="mt-4 flex items-center gap-x-4 text-xs">
									<time dateTime={(updatedAt || publishedAt).toString()} className="text-gray-500">
										{formatDate(updatedAt || publishedAt)}
									</time>
									<span
										// href={categorySlug}
										className={mergeClasses(
											'relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600',
											// 'hover:bg-gray-100'
										)}
									>
										{categorySlug}
									</span>
								</div>
								<div className="group relative">
									<h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
										<span className="absolute inset-0" />
										{displayTitle}
									</h3>
									<p className="mt-5 line-clamp-3 leading-6 text-gray-600">{displayDescription}</p>
								</div>
							</div>
						</Link>
					)
				})}
			</div>
		</PageContainer>
	)
}
