import { mergeClasses } from '@/library/utilities/public'
import { ContactForm } from './ContactForm'
import SectionHeader from './SectionHeader'

export default function ContactSection({ marginClasses }: { marginClasses: string }) {
	return (
		<div className={mergeClasses('isolate bg-white px-6 py-24 sm:py-32 lg:px-8', marginClasses)}>
			<SectionHeader
				title="Contact us"
				subtitle="We're a new business"
				intro="Whether you're interested in trying Simple Order, have questions about how it works, or want to share what features would help your wholesale business - we'd love to hear from you. Your feedback directly shapes what we build next."
			/>
			<ContactForm />
		</div>
	)
}
