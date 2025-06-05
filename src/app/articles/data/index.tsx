import type { ArticlesCollection } from '@/types'
import { affordableSoftwareArticles } from './affordableSoftware'
import { manualArticles } from './manualArticles'

export const allArticlesData: ArticlesCollection = {
	...manualArticles,
	...Object.assign({}, ...affordableSoftwareArticles),
}
