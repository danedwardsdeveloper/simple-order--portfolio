import { demoInventory } from '@/library/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import AddInventoryForm from './AddInventoryForm'

// ToDo: the output of these tests is massively chaotic and I have no idea if the problem is the tests or the code???

const defaultVat = 20

const mockAddProduct = vi.fn().mockResolvedValue(true)

describe('AddInventoryForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	type Suite = {
		suiteDescription: string
		cases: Case[]
	}

	type Case = {
		caseDescription: string
		formInputs: {
			name?: string
			description?: string
			priceInMinorUnits?: string
			customVat?: string
		}
		expectSubmitEnabled: boolean
	}

	const suites: Suite[] = [
		{
			suiteDescription: 'Submit button state based on form validity',
			cases: [
				{
					caseDescription: 'Submit button is disabled when form is empty',
					formInputs: {},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is disabled when name is empty',
					formInputs: {
						description: 'Test Description',
						priceInMinorUnits: '1000',
						customVat: '20',
					},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is disabled when price is empty',
					formInputs: {
						name: 'Test Product',
						description: 'Test Description',
						customVat: '20',
					},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is disabled when VAT is empty',
					formInputs: {
						name: 'Test Product',
						description: 'Test Description',
						priceInMinorUnits: '1000',
					},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is disabled when price is invalid (not a number)',
					formInputs: {
						name: 'Test Product',
						description: 'Test Description',
						priceInMinorUnits: 'invalid',
						customVat: '20',
					},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is disabled when VAT is invalid (not a number)',
					formInputs: {
						name: 'Test Product',
						description: 'Test Description',
						priceInMinorUnits: '1000',
						customVat: 'invalid',
					},
					expectSubmitEnabled: false,
				},
				{
					caseDescription: 'Submit button is enabled with valid required fields (with description)',
					formInputs: {
						name: 'Test Product',
						description: 'Test Description',
						priceInMinorUnits: '1000',
						customVat: '20',
					},
					expectSubmitEnabled: true,
				},
				{
					caseDescription: 'Submit button is enabled with valid required fields (without description)',
					formInputs: {
						name: 'Test Product',
						priceInMinorUnits: '1000',
						customVat: '20',
					},
					expectSubmitEnabled: true,
				},
				{
					caseDescription: 'Description being empty does not affect form validity',
					formInputs: {
						name: 'Test Product',
						description: '',
						priceInMinorUnits: '1000',
						customVat: '20',
					},
					expectSubmitEnabled: true,
				},
			],
		},
	]

	for (const { suiteDescription, cases } of suites) {
		describe(suiteDescription, () => {
			for (const { caseDescription, formInputs, expectSubmitEnabled } of cases) {
				test(caseDescription, async () => {
					render(<AddInventoryForm inventory={demoInventory} vat={defaultVat} addProduct={mockAddProduct} isSubmitting={false} />)

					// Fill in form fields
					if (formInputs.name !== undefined) {
						const nameInput = screen.getByLabelText('Name')
						fireEvent.change(nameInput, { target: { value: formInputs.name } })
					}

					if (formInputs.description !== undefined) {
						const descriptionInput = screen.getByLabelText(/Description/i)
						fireEvent.change(descriptionInput, { target: { value: formInputs.description } })
					}

					if (formInputs.priceInMinorUnits !== undefined) {
						const priceInput = screen.getByLabelText(/Price in pence/i)
						fireEvent.change(priceInput, { target: { value: formInputs.priceInMinorUnits } })
					}

					if (formInputs.customVat !== undefined) {
						const vatInput = screen.getByLabelText(/VAT percentage/i)
						fireEvent.change(vatInput, { target: { value: formInputs.customVat } })
					}

					await waitFor(() => {
						const submitButton = screen.getByRole('button', { name: /Add item/i })

						if (expectSubmitEnabled) {
							expect(submitButton).not.toHaveProperty('disabled')
						} else {
							expect(submitButton).toHaveProperty('disabled')
						}
					})
				})
			}
		})
	}

	test('Form should submit data correctly when all fields are valid', async () => {
		render(<AddInventoryForm inventory={demoInventory} vat={defaultVat} addProduct={mockAddProduct} isSubmitting={false} />)

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Product' } })
		fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } })
		fireEvent.change(screen.getByLabelText(/Price in pence/i), { target: { value: '2000' } })
		fireEvent.change(screen.getByLabelText(/VAT percentage/i), { target: { value: '15' } })

		const submitButton = await waitFor(() => screen.getByRole('button', { name: /Add item/i }))

		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(mockAddProduct).toHaveBeenCalledWith({
				name: 'New Product',
				description: 'New Description',
				priceInMinorUnits: '2000',
				customVat: '15',
			})
		})
	})
})

/* 
pnpm vitest src/app/inventory/components/AddInventoryForm.test.tsx
*/
