import type { testEmailInbox } from '@/library/database/schema';

export type TestEmail = typeof testEmailInbox.$inferSelect;
export type TestEmailInsertValues = typeof testEmailInbox.$inferInsert;
