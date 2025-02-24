import type {
	authenticationMessages,
	basicMessages,
	illegalCharactersMessages,
	missingFieldMessages,
	relationshipMessages,
	tokenMessages,
} from '@/library/constants'

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages]
export type AuthenticationMessages = (typeof authenticationMessages)[keyof typeof authenticationMessages]
export type IllegalCharactersMessages = (typeof illegalCharactersMessages)[keyof typeof illegalCharactersMessages]
export type RelationshipMessages = (typeof relationshipMessages)[keyof typeof relationshipMessages]
export type MissingFieldMessages = (typeof missingFieldMessages)[keyof typeof missingFieldMessages]
export type TokenMessages = (typeof tokenMessages)[keyof typeof tokenMessages]

export type EmailTokenMessages = TokenMessages | 'token used'
