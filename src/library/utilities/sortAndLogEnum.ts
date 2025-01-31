import { authenticationMessages, basicMessages } from '@/types'

function sortAndLogEnum(enumObject: Record<string, string>, name: string) {
  const entries = Object.entries(enumObject)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `  ${key}: '${value}'`)
    .join(',\n')

  console.log(`export const ${name} = {\n${entries}\n} as const`)
}

sortAndLogEnum(basicMessages, 'basicMessages')
sortAndLogEnum(authenticationMessages, 'authenticationMessages')

/* 
pnpm tsx src/library/utilities/sortAndLogEnum
*/
