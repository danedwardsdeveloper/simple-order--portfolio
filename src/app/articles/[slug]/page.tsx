import BreadCrumbs from '../BreadCrumbs'
import { articlesData } from '../data'

export function generateStaticParams() {
  return Object.keys(articlesData).map(slug => ({ slug }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  // await is necessary here, despite what VS Code says!
  const { slug } = await params
  const article = articlesData[slug]

  if (!article) return null

  return (
    <>
      <BreadCrumbs title={article.displayTitle} />
      <h1>{article.displayTitle}</h1>
      <div className="flex flex-col max-w-prose gap-y-4">
        {article.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </>
  )
}
