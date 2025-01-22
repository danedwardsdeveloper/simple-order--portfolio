export default function BlogHomePage() {
  interface ArticleDetails {
    slug: string
    displayTitle: string
  }

  const articleSlugs: ArticleDetails[] = [
    {
      slug: 'how-it-works',
      displayTitle: 'How It Works',
    },
    {
      slug: 'some-article',
      displayTitle: 'Some article',
    },
    {
      slug: 'another-article',
      displayTitle: 'Another Article',
    },
    {
      slug: 'yet-another-article',
      displayTitle: 'Yet Another Article',
    },
  ]

  return (
    <>
      <h1 className="mb-12">Blog</h1>
      <div className="grid grid-cols-2 gap-y-24">
        {articleSlugs.map((article, index) => (
          <div key={index} className="max-w-sm">
            <h2 className="text-xl font-medium mb-1">{article.displayTitle}</h2>
            <span className="text-zinc-500">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}</span>
          </div>
        ))}
      </div>
    </>
  )
}
