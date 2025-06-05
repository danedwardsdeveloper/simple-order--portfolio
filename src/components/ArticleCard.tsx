import { formatDate } from '@/library/utilities/public'
import type { ArticleDetails } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

type Props = Omit<ArticleDetails, 'content' | 'metaTitle' | 'metaDescription'> & {
	priority: boolean
}

export default function ArticleCard(props: Props) {
	return (
		<li>
			<Link href={`/articles/${props.slug}`} className="flex flex-col items-start group hover:opacity-80 duration-300 transition-opacity">
				<div className="relative w-full">
					<Image
						alt={props.featuredImage.alt}
						src={props.featuredImage.src}
						priority={props.priority}
						placeholder="blur"
						className="w-full rounded-md bg-gray-100 object-cover"
					/>
					<div className="absolute inset-0 rounded-md ring-1 ring-inset ring-gray-900/10" />
				</div>
				<div className="max-w-xl">
					<div className="mt-4 flex items-center gap-x-4 text-xs">
						<time dateTime={(props.updatedAt || props.publishedAt).toString()} className="text-gray-500">
							{formatDate(props.updatedAt || props.publishedAt)}
						</time>
						<span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">{props.category.display}</span>
					</div>
					<div className="group relative">
						<h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
							<span className="absolute inset-0" />
							{props.displayTitle}
						</h3>
						<p className="mt-5 line-clamp-3 leading-6 text-gray-600">{props.displayDescription}</p>
					</div>
				</div>
			</Link>
		</li>
	)
}
