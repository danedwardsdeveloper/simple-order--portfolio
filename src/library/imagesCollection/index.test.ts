import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, test } from 'vitest'
import { getImagePath, imagesCollection } from '.'

const publicDirectory = join(process.cwd(), 'public')

const imagesArray = Object.values(imagesCollection).flat()

const relativePaths = imagesArray.map((collectedImage) => {
	const { relative: relativePhotoPath } = getImagePath(collectedImage)
	return { collectedImage, relativePhotoPath, fullPath: join(publicDirectory, relativePhotoPath) }
})

describe('PNG image with correct file name is in /public/images', () => {
	for (const { relativePhotoPath, fullPath } of relativePaths) {
		test(relativePhotoPath, () => {
			expect(existsSync(fullPath)).toBe(true)
		})
	}
})

describe('Dimensions are 1,200 * 630', () => {
	for (const { relativePhotoPath, fullPath } of relativePaths) {
		test(relativePhotoPath, async () => {
			const metadata = await sharp(fullPath).metadata()

			expect(metadata.height).toEqual(630)
			expect(metadata.width).toEqual(1200)
		})
	}
})

/* 
pnpm vitest src/library/imagesCollection
*/
