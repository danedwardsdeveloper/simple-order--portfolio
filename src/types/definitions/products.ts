import { products } from '@/library/database/schema'

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ClientProduct = Pick<Product, 'id' | 'name' | 'description' | 'priceInMinorUnits' | 'customVat'>
