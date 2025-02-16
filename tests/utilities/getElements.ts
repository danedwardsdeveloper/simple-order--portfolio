import type { ElementHandle, Page } from 'puppeteer'

export class getElements {
	private static page: Page

	static initialise(page: Page) {
		getElements.page = page
	}

	static async byTestId(testId: string): Promise<ElementHandle | null> {
		return await getElements.page.$(`[data-test-id="${testId}"]`)
	}

	static async exists(testId: string): Promise<boolean> {
		const element = await getElements.byTestId(testId)
		return element !== null
	}
}
