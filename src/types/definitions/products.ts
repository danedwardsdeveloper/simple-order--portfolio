import type { products } from '@/library/database/schema'

export type Product = typeof products.$inferSelect
export type ProductInsertValues = typeof products.$inferInsert

// Keep the id here as it's useful for React mapping as it's guaranteed to be unique
export type BrowserSafeMerchantProduct = Pick<Product, 'id' | 'name' | 'description' | 'priceInMinorUnits' | 'customVat' | 'deletedAt'>

export type BrowserSafeCustomerProduct = Omit<BrowserSafeMerchantProduct, 'deletedAt'>
