import type { EmailVersions } from '@/types'
import { createHtmlParagraph } from './createHtmlParagraph'

type Input = Array<string | { content: string; bold: true }>

export function formatSimpleEmail(plainParagraphs: Input): EmailVersions {
	const formattedParagraphs: string[] = []
	let textVersion = ''

	plainParagraphs.map((node) => {
		if (typeof node === 'string') {
			formattedParagraphs.push(createHtmlParagraph(node))
			textVersion += `${node}\n\n`
		} else {
			formattedParagraphs.push(createHtmlParagraph(node.content, 'semibold'))
			textVersion += `${node.content}\n\n`
		}
	})

	return {
		htmlVersion: formattedParagraphs.join(''),
		textVersion: textVersion.trim(),
	}
}
