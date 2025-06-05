import HomePageContent from '@/components/HomePageContent'
import { currencyOptions } from '@/library/constants'

export default function HomePage() {
	return <HomePageContent pricingDetails={currencyOptions.GBP} />
}
