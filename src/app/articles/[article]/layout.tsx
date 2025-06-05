import ContactSection from '@/components/ContactSection'
import CtaSection from '@/components/CtaSection'
import PageContainer from '@/components/PageContainer'
import Pricing from '@/components/Pricing'
import { currencyOptions } from '@/library/constants'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<PageContainer>{children}</PageContainer>
			<CtaSection marginClasses="mt-52" />
			<Pricing marginClasses="mt-52" pricingDetails={currencyOptions.GBP} />
			<ContactSection marginClasses="mt-20" />
		</>
	)
}
