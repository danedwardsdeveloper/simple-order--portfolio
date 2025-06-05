import { z } from 'zod'

export const allowedCharactersRegex = /^[\p{L}\p{N}',.!?\- ]+$/u

export function validCharacters(message?: string, allowEmpty = false) {
	return z.string().refine((val) => (allowEmpty && val === '' ? true : allowedCharactersRegex.test(val)), {
		message: message || "Only letters, numbers, and ',.!? - are allowed.",
	})
}
