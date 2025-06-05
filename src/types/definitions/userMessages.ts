import type { userMessages } from '@/library/constants'

export type UserMessages = (typeof userMessages)[keyof typeof userMessages]
