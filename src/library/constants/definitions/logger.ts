export const logLevels = {
	level0none: 0,
	level1error: 1,
	level2warn: 2,
	level3success: 3,
	level4info: 4,
	level5debug: 5,
} as const

export const browserColours = {
	debug: 'color: #c084fc', // Purple
	info: 'color: #3498DB', // Blue
	success: 'color: #16a34a', // Green
	warn: 'color: #FFA500', // Orange
	error: 'color: #FF3838', // Red
}

export const serverColors = {
	reset: '\x1b[0m',
	debug: '\x1b[35m', // Magenta
	info: '\x1b[34m', // Blue
	success: '\x1b[32m', // Green
	warn: '\x1b[33m', // Yellow
	error: '\x1b[31m', // Red
} as const
