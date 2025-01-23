import Link from 'next/link'

import { articlesData } from './data'

export default function AllArticlesPage() {
  return (
    <>
      <h1>Articles</h1>
      <div className="grid grid-cols-2 gap-y-24">
        {Object.keys(articlesData).map(slug => (
          <Link
            key={slug}
            href={`/articles/${slug}`}
            className="max-w-sm p-2 hover:bg-blue-50 rounded-lg transition-colors duration-300"
          >
            <h2 className="text-xl font-medium mb-1">{articlesData[slug].displayTitle}</h2>
            <span className="text-zinc-500">{articlesData[slug].content[0]}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
