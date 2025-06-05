import { allArticlesData } from '@/app/articles/data'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { isArticleSlug } from '@/library/utilities/tsx'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

type ResolvedParams = { article: string }
type Params = Promise<ResolvedParams>
type StaticParams = Promise<ResolvedParams[]>

export async function generateStaticParams(): StaticParams {
	return Object.keys(allArticlesData).map((article) => ({ article }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { article } = await params
	if (!isArticleSlug(article)) return notFound()
	const articleData = allArticlesData[article]

	if (!articleData) notFound()

	const { metaTitle, metaDescription } = articleData

	return {
		title: { absolute: metaTitle },
		// ToDo: use optimise metadata!
		description: metaDescription,
		alternates: {
			canonical: `${dynamicBaseURL}/articles/${article}`,
		},
	}
}

export default async function ArticlePage({ params }: { params: Params }) {
	const { article } = await params
	if (!isArticleSlug(article)) return notFound()

	const articleData = allArticlesData[article]
	if (!articleData) return notFound()

	const {
		displayTitle,
		content,
		featuredImage: { src, alt },
	} = articleData

	return (
		<>
			<SignedOutBreadCrumbs
				trail={[{ href: '/articles', displayName: 'Articles' }]} //
				currentPageTitle={displayTitle}
			/>
			<h1 className="sm:text-5xl text-balance">{displayTitle}</h1>
			<p className="mb-12">By Dan Edwards</p>
			<Image
				src={src}
				alt={alt}
				className="max-w-xl w-full rounded-md mb-12"
				// sizes="ToDo"
				priority
			/>
			<div className="article-content flex flex-col max-w-prose gap-y-4 my-8 text-lg">
				{content.map((block, index) => {
					if (typeof block === 'string') {
						// biome-ignore lint/suspicious/noArrayIndexKey:
						return <p key={index}>{block}</p>
					}
					// biome-ignore lint/suspicious/noArrayIndexKey:
					return <Fragment key={index}>{block}</Fragment>
				})}
			</div>
			<hr className="border-t-2 border-zinc-300 mt-32 h-2" />
		</>
	)
}
