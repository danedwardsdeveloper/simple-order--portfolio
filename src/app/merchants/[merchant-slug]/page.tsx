import { use } from 'react'

type Props = {
	params: Promise<{
		'merchant-slug': string
	}>
}

export default function MerchantPage({ params }: Props) {
	const resolvedParams = use(params)
	const merchantSlug = resolvedParams['merchant-slug']

	return <h1>{merchantSlug}</h1>
}
