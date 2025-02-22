import type {
	authenticationMessages,
	basicMessages,
	illegalCharactersMessages,
	relationshipMessages,
	tokenMessages,
} from '@/library/constants'

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages]

export type AuthenticationMessages = (typeof authenticationMessages)[keyof typeof authenticationMessages]

export type IllegalCharactersMessages = (typeof illegalCharactersMessages)[keyof typeof illegalCharactersMessages]

export type TokenMessages = (typeof tokenMessages)[keyof typeof tokenMessages]

export type RelationshipMessage = (typeof relationshipMessages)[keyof typeof relationshipMessages]
