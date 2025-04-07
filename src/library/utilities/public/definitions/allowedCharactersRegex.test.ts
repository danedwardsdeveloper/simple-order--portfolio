import { describe, expect, test } from 'vitest'
import { allowedCharactersRegex } from './allowedCharactersRegex'

const acceptedItems = [
	'lowercase string',
	'UPPERCASE STRING',

	// cspell:disable-next-line
	'Frénçh nâme',
	'name-with-dash',
	"'single quotes'",
	'Numbers 123 and 456',
	'Comma,',
	'!Exclamation mark!,',

	// cspell:disable-next-line
	'Latin чαrαcтers',
	'Multiple     spaces',

	// cspell:disable-next-line
	'Español con ñ y á é í ó ú',

	// cspell:disable-next-line
	'Deutsch mit ä ö ü ß',
]

const rejectedItems = [
	'<angle brackets>',
	`"double quotes"`,
	'_under_scores_',
	'`backticks`',
	'Emoji 😀',
	'Slash/character',
	'Backslash\\character',
	'Curly {braces}',
	'Square [brackets]',
	'(Parentheses)',
	'Plus+symbol',
	'Equals=sign',
	'At@symbol',
	'Hash#tag',
	'Dollar$sign',
	'Percent%value',
	'Caret^character',
	'Ampersand&symbol',
	'Asterisk*wildcard',
	'Pipe|character',
	'Tilde~character',
]

describe('allowedCharactersRegex', () => {
	acceptedItems.map((item) => {
		test(`Accepts ${item}`, () => {
			expect(allowedCharactersRegex.test(item)).toBe(true)
		})
	})

	rejectedItems.map((item) => {
		test(`Rejects ${item}`, () => {
			expect(allowedCharactersRegex.test(item)).toBe(false)
		})
	})
})

/*
pnpm vitest src/library/utilities/public/definitions/allowedCharactersRegex
*/
