import { pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['merchant', 'customer', 'both'])

export const drizzleTest = pgTable('drizzle_test', {
  id: serial('id').primaryKey(),
  firstName: text('first').notNull(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
})

export type DrizzleTest = typeof drizzleTest.$inferSelect
export type NewDrizzleTest = typeof drizzleTest.$inferInsert
