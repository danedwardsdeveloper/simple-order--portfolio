import type { invitations } from '@/library/database/schema'

export type Invitation = typeof invitations.$inferSelect
export type InvitationInsert = typeof invitations.$inferInsert
