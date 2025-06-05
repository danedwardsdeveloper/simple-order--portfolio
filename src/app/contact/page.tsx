import ContactSection from '@/components/ContactSection'
import PageContainer from '@/components/PageContainer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Contact', // + template
	alternates: {
		canonical: '/contact',
	},
}

export default function ContactPage() {
	return (
		<PageContainer>
			<ContactSection marginClasses="" />
		</PageContainer>
	)
}
