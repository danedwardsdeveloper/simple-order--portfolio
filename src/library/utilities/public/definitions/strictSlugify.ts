import slugify from 'slugify'

export function strictSlugify(businessName: string): string {
	return slugify(businessName, {
		remove: /[*+~.()'"!:@]/g,
		strict: true,
		lower: true,
		locale: '',
	})
}
