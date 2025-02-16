import { authenticationMessages, basicMessages } from '@/types'

function sortAndLogEnum(enumObject: Record<string, string>, _name: string) {
	const _entries = Object.entries(enumObject)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `  ${key}: '${value}'`)
		.join(',\n')
}

sortAndLogEnum(basicMessages, 'basicMessages')
sortAndLogEnum(authenticationMessages, 'authenticationMessages')

/* 
pnpm tsx src/library/utilities/sortAndLogEnum
*/
