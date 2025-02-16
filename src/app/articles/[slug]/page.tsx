import PageContainer from '@/components/PageContainer'
import BreadCrumbs from '../BreadCrumbs'
import { articlesData } from '../data'

export function generateStaticParams() {
	return Object.keys(articlesData).map((slug) => ({ slug }))
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const article = articlesData[slug]

	if (!article) return null

	return (
		<PageContainer>
			<BreadCrumbs title={article.displayTitle} />
			<h1>{article.displayTitle}</h1>
			<div className="flex flex-col max-w-prose gap-y-4">
				{article.paragraphs.map((paragraph) => (
					<p key={paragraph.id}>{paragraph.content}</p>
				))}
			</div>
		</PageContainer>
	)
}
