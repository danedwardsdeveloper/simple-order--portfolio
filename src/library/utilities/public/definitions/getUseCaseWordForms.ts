import type { UseCase } from '@/types'
import { strictSlugify } from './strictSlugify'

export function getUseCaseWordForms(useCase: UseCase) {
	const { industry, industries: baseIndustries, business, people, activity } = useCase

	const industries = baseIndustries || `${industry}s`
	const wholesaleBusiness = `Wholesale ${business}`

	return {
		industry,
		lowercaseIndustry: industry.toLowerCase(),

		industries,
		lowercaseIndustries: industries.toLowerCase(),

		business,
		lowercaseBusiness: business.toLowerCase(),
		wholesaleBusiness,
		lowercaseWholesaleBusiness: wholesaleBusiness.toLowerCase(),

		slugShort: strictSlugify(industry),
		slugWholesale: strictSlugify(wholesaleBusiness),

		people,
		lowercasePeople: people.toLowerCase(),

		activity,
		lowercaseActivity: activity.toLowerCase(),
	}
}
