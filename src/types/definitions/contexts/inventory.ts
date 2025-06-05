import type { InventoryItemPATCHbody } from '@/app/api/inventory/[itemId]/patch'
import type { InventoryAddFormData } from '@/library/validations'
import type { BrowserSafeMerchantProduct } from '../products'

export interface InventoryContextType {
	isSubmitting: boolean
	addProduct: (formData: InventoryAddFormData) => Promise<boolean>

	deleteProduct: (productId: number) => Promise<boolean>
	isDeleting: boolean

	updateProduct: (currentData: BrowserSafeMerchantProduct, updateData: InventoryItemPATCHbody) => Promise<boolean>
	isUpdating: boolean
}
