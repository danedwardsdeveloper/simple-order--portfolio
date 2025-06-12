import { websiteCopy } from '@/library/constants'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import type { PricingDetails } from '@/types'
import type { SoftwareApplication, WithContext } from 'schema-dts'
import { StructuredData } from '../StructuredData'

export default function SoftwareSchema({ pricingDetails }: { pricingDetails: PricingDetails }) {
	// ToDo: add screenshot of the software
	const softwareSchema: WithContext<SoftwareApplication> = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Simple Order',
		description: websiteCopy.extras.selfContainedDescription,
		url: dynamicBaseURL,
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web-based',
		offers: {
			'@type': 'Offer',
			name: 'Monthly membership',
			description: 'Simple Order monthly subscription for wholesale order management',
			price: pricingDetails.amountInMinorUnits / 100,
			priceCurrency: pricingDetails.upperCaseCode,
			eligibleCustomerType: {
				'@type': 'BusinessEntityType',
				name: 'Business',
			},
			availability: 'https://schema.org/InStock',
		},
		featureList: [
			// ToDo!
			'Wholesale order management system',
			'Phone-free order management',
			'Holiday management',
			'Order cut-off times',
			'Up to 50 customers',
			'Up to 50 products',
		],
		author: {
			'@type': 'Organization',
			name: 'Simple Order',
		},
	}
	return <StructuredData data={softwareSchema} />
}
