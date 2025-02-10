import { ElementHandle, Page } from 'puppeteer'

export class getElements {
  private static page: Page

  static initialise(page: Page) {
    this.page = page
  }

  static async byTestId(testId: string): Promise<ElementHandle | null> {
    return await this.page.$(`[data-test-id="${testId}"]`)
  }

  static async exists(testId: string): Promise<boolean> {
    const element = await this.byTestId(testId)
    return element !== null
  }
}
