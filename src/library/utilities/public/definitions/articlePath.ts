import type { ManualArticleSlug } from '@/types'

export function articlePath(slug: ManualArticleSlug) {
	return `/articles/${slug}`
}
