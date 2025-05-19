import { serviceConstraints } from '@/library/constants'
import { formatPrice } from '@/library/utilities/public'
import { z } from 'zod'
import { validCharacters } from './validCharacters'

// ToDo List
// - Change names to addProductFormInputSchema etc
// Move types to /types

const { maximumProductValueInMinorUnits: maxPrice, maximumProductDescriptionCharacters: maxDescriptionLength } = serviceConstraints

// before transformations
export const inventoryAddFormInputSchema = z.object({
	name: z.string().min(1, { message: 'Product name is required' }).pipe(validCharacters()),

	description: z
		.string()
		.max(maxDescriptionLength, {
			message: `Description must be less than ${maxDescriptionLength} characters`,
		})
		.pipe(validCharacters())
		.optional()
		.nullable(),

	priceInMinorUnits: z
		.string()
		.refine((val) => val === '' || !Number.isNaN(Number(val)), {
			message: 'Price must be a valid number',
		})
		.refine((val) => val === '' || (Number(val) >= 0 && Number(val) <= maxPrice), {
			message: `Price must be less than ${formatPrice(maxPrice)}`,
		}),

	customVat: z.string().refine((val) => !Number.isNaN(Number(val)), {
		message: 'VAT must be a valid number',
	}),
})

export type InventoryAddFormData = z.infer<typeof inventoryAddFormInputSchema>

// After transformations
export const inventoryAddFormSchema = inventoryAddFormInputSchema
	.transform((data) => {
		return {
			name: data.name,
			description: data.description,
			priceInMinorUnits: data.priceInMinorUnits === '' ? 0 : Number.parseInt(data.priceInMinorUnits, 10),
			customVat: Number.parseInt(data.customVat, 10),
		}
	})
	.refine((data) => data.priceInMinorUnits >= 0 && data.priceInMinorUnits <= serviceConstraints.maximumProductValueInMinorUnits, {
		message: `Price must be between 0 and ${serviceConstraints.maximumProductValueInMinorUnits}`,
		path: ['priceInMinorUnits'],
	})
	.refine((data) => data.customVat >= 0 && data.customVat <= serviceConstraints.highestVat, {
		message: `VAT must be between 0 and ${serviceConstraints.highestVat}%`,
		path: ['customVat'],
	})

// Type for transformed data
export type ParsedInventoryData = z.output<typeof inventoryAddFormSchema>

// For partial updates
export const inventoryUpdateFormSchema = inventoryAddFormInputSchema.partial()
export type InventoryUpdateFormData = z.infer<typeof inventoryUpdateFormSchema>
