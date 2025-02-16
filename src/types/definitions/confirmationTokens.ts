import type { confirmationTokens } from '@/library/database/schema'

export type ConfirmationToken = typeof confirmationTokens.$inferSelect
export type NewConfirmationToken = typeof confirmationTokens.$inferInsert
