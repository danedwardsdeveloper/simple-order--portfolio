import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import { articlesData } from '@/library/articles/data'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { isArticleSlug } from '@/library/utilities/public'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

export function generateStaticParams() {
	return Object.keys(articlesData).map((slug) => ({ slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata | null> {
	const { slug } = await params
	if (!isArticleSlug(slug)) return null
	const article = articlesData[slug]

	if (!article) notFound()

	const { metaTitle, metaDescription } = article

	return {
		title: metaTitle,
		description: metaDescription,
		alternates: {
			canonical: `${dynamicBaseURL}/articles/${slug}`,
		},
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	if (!isArticleSlug(slug)) return null
	const article = articlesData[slug]
	if (!article) return null

	const {
		displayTitle,
		content,
		featuredImage: { src, alt },
	} = article

	return (
		<>
			<SignedOutBreadCrumbs
				trail={[{ href: '/articles', displayName: 'Articles' }]} //
				currentPageTitle={displayTitle}
			/>
			<h1>{displayTitle}</h1>
			<p className="mb-12">By Dan Edwards</p>
			<Image src={src} alt={alt} className="max-w-xl rounded-md mb-12" sizes="ToDo" />
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
			{/* Testimonials */}
			{/* CTA section */}
		</>
	)
}
