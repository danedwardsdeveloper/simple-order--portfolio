import { freeTrials } from '@/library/database/schema'

export type FreeTrial = typeof freeTrials.$inferSelect
export type NewFreeTrial = typeof freeTrials.$inferInsert
