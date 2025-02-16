export const logLevels = {
	level0none: 0,
	level1error: 1,
	level2warn: 2,
	level3info: 3,
	level4debug: 4,
} as const

export type LogLevel = keyof typeof logLevels
