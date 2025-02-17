import type { ElementHandle, Page } from 'puppeteer'

let browserPage: Page

export const initializePage = (newPage: Page) => {
	browserPage = newPage
}

export const getElementByTestId = async (testId: string): Promise<ElementHandle | null> => {
	if (!browserPage) {
		throw new Error('Page not initialized. Import and call initializePage from test/utilities/getElements first.')
	}
	return await browserPage.$(`[data-test-id="${testId}"]`)
}

export const elementExists = async (testId: string): Promise<boolean> => {
	const element = await getElementByTestId(testId)
	return element !== null
}
