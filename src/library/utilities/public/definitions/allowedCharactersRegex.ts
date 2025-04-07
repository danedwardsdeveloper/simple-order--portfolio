export const allowedCharactersRegex = /^[a-zA-Z0-9',.!?\- ]+$/

/**
 * @deprecated Use allowedCharactersRegex / Zod instead
 */
export const allowedCharacters = {
	letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers: '0123456789',
	punctuation: `',.!?-`,
	space: ' ',
}

/**
 * @deprecated Use allowedCharactersRegex / Zod instead
 */
export function containsIllegalCharacters(input: string): boolean {
	const allAllowedCharacters = [
		...allowedCharacters.letters,
		...allowedCharacters.numbers,
		...allowedCharacters.punctuation,
		...allowedCharacters.space,
	]
	return input.split('').some((character) => !allAllowedCharacters.includes(character))
}
