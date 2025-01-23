import { articlesData } from '../data'

export function generateStaticParams() {
  return Object.keys(articlesData).map(slug => ({ slug }))
}

export default function Page({ params }: { params: { slug: string } }) {
  const article = articlesData[params.slug]

  if (!article) return null

  return (
    <>
      <h1>{article.displayTitle}</h1>
      <div className="flex flex-col max-w-prose gap-y-4">
        {article.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </>
  )
}
