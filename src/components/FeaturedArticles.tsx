import { allArticlesData } from '@/app/articles/data'
import { mergeClasses } from '@/library/utilities/public'
import ArticleCard from './ArticleCard'
import SectionHeader from './SectionHeader'

export default function FeaturedArticles({ marginClasses }: { marginClasses: string }) {
	// This is not type safe!!
	const featuredArticleSlugs = ['how-it-works', 'about']

	return (
		<div className={mergeClasses('max-w-4xl mx-auto w-full px-6 py-8 sm:py-20 lg:px-8 ', marginClasses)}>
			<SectionHeader title="Articles" intro="The latest writing from our wholesale order management experts" />
			<ul className={mergeClasses('mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2')}>
				{featuredArticleSlugs.map((slug) => {
					const { publishedAt, updatedAt, category, displayTitle, displayDescription, featuredImage } = allArticlesData[slug]

					return (
						<ArticleCard
							key={slug}
							priority={false}
							displayTitle={displayTitle}
							slug={slug}
							displayDescription={displayDescription}
							publishedAt={publishedAt}
							updatedAt={updatedAt}
							featuredImage={featuredImage}
							category={category}
						/>
					)
				})}
			</ul>
		</div>
	)
}
