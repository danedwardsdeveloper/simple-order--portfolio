interface ArticleDetails {
  displayTitle: string
  content: string[]
}

export const articlesData: Record<string, ArticleDetails> = {
  'how-it-works': {
    displayTitle: 'Simple Order: How It Works',
    content: ['This is a paragraph', 'This is a another very interesting paragraph. ', 'Content!'],
  },
  'some-article': {
    displayTitle: 'Some article',
    content: ['This is a paragraph', 'This is a another very interesting paragraph. ', 'Content!'],
  },
  'another-article': {
    displayTitle: 'Another Article',
    content: ['This is a paragraph', 'This is a another very interesting paragraph. ', 'Content!'],
  },
  'yet-another-article': {
    displayTitle: 'Yet Another Article',
    content: ['This is a paragraph', 'This is a another very interesting paragraph. ', 'Content!'],
  },
}
