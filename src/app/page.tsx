import Pricing from '@/components/Pricing'
import HeroSection from '@/components/heroSection'

/**
 * Export the entire homepage to use on the 404 page
 * Never miss an opportunity to explain your brand!
 */
export function HomePageContent() {
	return (
		<>
			<HeroSection />
			<Pricing />
		</>
	)
}

export default function HomePage() {
	return <HomePageContent />
}
