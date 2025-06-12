import ContactSection from '@/components/ContactSection'
import CtaSection from '@/components/CtaSection'
import FeaturedArticles from '@/components/FeaturedArticles'
import Features from '@/components/Features'
import HeroSection from '@/components/HeroSection'
import Pricing, { type PricingProps } from '@/components/Pricing'
import UseCases from '@/components/UseCases'
import SoftwareSchema from './JsonLdSchemas/SoftwareSchema'

type Props = Pick<PricingProps, 'pricingDetails'>

export default function HomePageContent(props: Props) {
	return (
		<>
			<SoftwareSchema pricingDetails={props.pricingDetails} />

			<HeroSection marginClasses="mt-14" pricingDetails={props.pricingDetails} />
			<Features marginClasses="mt-32" />
			<Pricing marginClasses="mt-56" pricingDetails={props.pricingDetails} />
			<UseCases marginClasses="mt-32" />
			<CtaSection marginClasses="mt-52" />
			<FeaturedArticles marginClasses="mt-52" />
			<ContactSection marginClasses="" />
		</>
	)
}
