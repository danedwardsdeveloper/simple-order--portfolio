type FontWeight = 'normal' | 'semibold'

export function createHtmlParagraph(content: string, weight: FontWeight = 'normal'): string {
	return `<p style="margin-bottom: 16px; font-size: 16px; line-height: 1.5; font-weight: ${weight === 'semibold' ? '600' : '400'};">${content}</p>`
}
