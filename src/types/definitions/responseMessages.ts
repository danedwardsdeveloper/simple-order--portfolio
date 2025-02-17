import type {
	authenticationMessages,
	basicMessages,
	illegalCharactersMessages,
} from '@/library/constants/responseMessages';

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages];

export type AuthenticationMessages =
	(typeof authenticationMessages)[keyof typeof authenticationMessages];

export type IllegalCharactersMessages =
	(typeof illegalCharactersMessages)[keyof typeof illegalCharactersMessages];
