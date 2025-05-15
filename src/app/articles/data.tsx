import { april, february } from '@/library/constants'
import { imagesCollection } from '@/library/imagesCollection'
import { createDate } from '@/library/utilities/public'
import { type ArticlesCollection, articleCategories } from '@/types'
import Link from 'next/link'

export const articlesData: ArticlesCollection = {
	'how-it-works': {
		slug: 'how-it-works',
		displayTitle: 'Simple Order: How it works',
		metaTitle: 'How Simple Order works: how to use our order management website',
		displayDescription: 'Our straightforward platform helps you manage customer orders without the complexity of other systems.',
		metaDescription:
			'How Simple Order works for your wholesale business. Our straightforward platform helps you manage customer orders without the complexity of other systems.',
		publishedAt: createDate(20, february, 2025),
		featuredImage: imagesCollection.default,
		category: articleCategories.legal,
		content: [
			<p>Simple Order is a website for wholesalers to manage their customer orders.</p>,
			<p>The platform handles the order process while you maintain your existing payment methods and delivery arrangements.</p>,
			<p>
				Whether you're a bakery selling to restaurants, a florist supplying to event planners, or an auto parts dealer serving repair shops,
				our system streamlines your wholesale operation.
			</p>,
			<h2>How it works for merchants</h2>,
			<p>Setting up is super fast, and you can get started right now:</p>,
			<ol>
				<li>
					<strong>Create your account:</strong> Just a few basic business details.
				</li>
				<li>
					<strong>Confirm your email:</strong> Click the link in the email we'll send you.
				</li>
				<li>
					<strong>Add your products and prices:</strong> You can get started with just a product name and price.
					<ul>
						<li>You can add descriptions, photos, and other details later if you'd like.</li>
					</ul>
				</li>
				<li>
					<strong>Set your preferences:</strong>
					<ul>
						<li>Set your minimum order details (by price or quantity)</li>
						<li>Your accepted delivery day schedule and any holidays</li>
						<li>Order cutoff time</li>
						<li>Email preferences</li>
					</ul>
				</li>
				<li>
					<strong>Invite your customers:</strong> They'll receive an email asking them to accept your invitation, and we'll ask them for a
					few basic details.
				</li>
				<li>
					<strong>Start receiving orders:</strong> Your customers can then browse your inventory and place an order.
				</li>
				<li>
					<strong>Mark the orders as completed:</strong> Now it's down to you to do what you do best - supplying customers with your
					products. You can mark the order as 'Completed'.
				</li>
			</ol>,
			<h2>Simple by design</h2>,
			<p>We've deliberately kept things straightforward:</p>,
			<ul>
				<li>No complex integrations to set up</li>
				<li>No unnecessary features you won't use</li>
				<li>No steep learning curve</li>
			</ul>,
			<p>It's just a simple and effective way to manage your wholesale orders.</p>,
			<p>Need help? Our support team is ready to get you started.</p>,
		],
	},
	about: {
		utilityPage: true,
		slug: 'about',
		displayTitle: 'About Simple Order',
		metaTitle: 'About Simple Order | Wholesale order management',
		displayDescription:
			'Discover who we are, why we built Simple Order, and how our affordable platform helps UK wholesalers manage orders with ease.',
		metaDescription:
			'Simple Order offers an affordable £19.50/month order management system for UK wholesalers. Founded by Dan Edwards in 2025, we simplify wholesale ordering.',
		featuredImage: imagesCollection.baristas,
		category: articleCategories.gettingStarted,
		publishedAt: createDate(29, february, 2025),
		updatedAt: createDate(28, april, 2025),
		content: [
			<h2>What we do</h2>,
			'Simple Order helps small bakeries and wholesalers manage their orders online.',
			'No phone calls. No complicated software. Just a simple website where your customers can place orders, and you can see them all in one place.',
			<h2>Our story</h2>,
			<p>
				Software developer <Link href="https://danedwardsdeveloper.com/">Dan Edwards</Link> founded Simple Order in January 2025 after
				seeing how much time small bakeries wasted taking orders by phone.
			</p>,
			"With experience in both software development and retail (Dan's mum owns a village shop), he built a solution that actually works for small wholesalers.",
			<h2>Why we're different</h2>,
			<h3>We're deliberately simple</h3>,
			"We don't do accounting, payments, or complex inventory management. We just handle orders, and we do it really well.",
			<h3>We're affordable</h3>,
			"At just £19.50 per month, we're much cheaper than competitors who charge £80-150 monthly.",
			<h3>We're friction-free</h3>,
			'Start your 30-day free trial without entering any card details. No risk, no hassle, no sales calls.',
			<h3>We're flexible</h3>,
			"Use the same account to sell to your customers and order from your suppliers with a simple toggle. Perfect if you're both a buyer and a seller.",
			<h2>Who we're for</h2>,
			'Simple Order is perfect for:',
			<ul>
				<li>Small UK bakeries who supply cafes and shops</li>
				<li>Food producers who sell to retailers</li>
				<li>Any wholesaler with regular customers and predictable orders</li>
				<li>Businesses who want to save time without learning complex software</li>
			</ul>,
			<h2>Our approach</h2>,
			'We believe in:',
			<ul>
				<li>Calm, distraction-free interfaces with plenty of whitespace</li>
				<li>Only including features you actually need</li>
				<li>Making software that respects your existing business relationships</li>
				<li>Saving you time to focus on what you do best</li>
			</ul>,
			<h2>Try it yourself</h2>,
			'Ready to simplify your ordering process? Start your free 30-day trial today with no card details required.',
		],
	},
	'gdpr-compliance': {
		utilityPage: true,
		slug: 'gdpr-compliance',
		displayTitle: 'GDPR compliance',
		metaTitle: "GDPR compliance | Simple Order's Data Protection Commitment",
		displayDescription:
			'How we protect your data and comply with GDPR regulations to ensure your business information is secure and properly managed.',
		metaDescription:
			"Simple Order's GDPR compliance statement explains how we collect, process, and protect your data in accordance with EU data protection laws.",
		publishedAt: createDate(28, april, 2025),
		category: articleCategories.legal,
		featuredImage: imagesCollection.threeBakers,
		content: [
			<h2>Our Commitment to Data Protection</h2>,
			<p>
				At Simple Order, we take your privacy and data protection seriously. This statement outlines how we comply with the General Data
				Protection Regulation (GDPR) and protect your personal data when you use our wholesale order management platform.
			</p>,

			<h2>Who We Are</h2>,
			<p>
				Simple Order (simpleorder.co.uk) is a wholesale order management platform operated by Dan Edwards, based in the United Kingdom. We
				provide a streamlined platform for wholesalers to manage customer orders online.
			</p>,

			<h2>Data Controller</h2>,
			<p>
				Simple Order acts as a data controller for the personal data we collect directly from you when you register an account or use our
				services. For merchants using our platform, we act as a data processor for the customer data they upload or invite to the platform.
			</p>,

			<h2>Data We Collect</h2>,
			<p>We collect and process only the minimum data necessary to provide our service:</p>,

			<h3>Account Information</h3>,
			<ul>
				<li>Name</li>
				<li>Email address (which must be confirmed)</li>
				<li>Business name</li>
				<li>Business contact details</li>
			</ul>,

			<h3>Usage Data</h3>,
			<ul>
				<li>Order information</li>
				<li>Product information</li>
				<li>Basic analytics data (page views, countries)</li>
			</ul>,

			<h3>Technical Data</h3>,
			<ul>
				<li>IP address</li>
				<li>Browser information</li>
				<li>Device information</li>
				<li>Cookies essential for site functionality</li>
			</ul>,

			<h2>Legal Basis for Processing</h2>,
			<p>We process your data based on:</p>,
			<ul>
				<li>
					<strong>Contractual necessity</strong>: To provide the order management service you've requested
				</li>
				<li>
					<strong>Legitimate interests</strong>: To improve our services and ensure security
				</li>
				<li>
					<strong>Consent</strong>: Where specifically requested for optional features
				</li>
				<li>
					<strong>Legal obligation</strong>: To comply with UK and EU laws
				</li>
			</ul>,

			<h2>How We Use Your Data</h2>,
			<p>We use your personal data exclusively to:</p>,
			<ul>
				<li>Provide and manage your Simple Order account</li>
				<li>Process and facilitate orders between merchants and customers</li>
				<li>Send transactional emails related to orders and account security</li>
				<li>Maintain the security and functionality of our platform</li>
				<li>Improve our service based on aggregated, anonymized usage data</li>
			</ul>,

			<h2>Data Storage and Security</h2>,
			<ul>
				<li>All data is stored on secure servers within the UK/EU</li>
				<li>We use Neon for database hosting and Fly.io for application hosting</li>
				<li>We employ industry-standard encryption and security measures</li>
				<li>We regularly review and update our security practices</li>
			</ul>,

			<h2>Data Retention</h2>,
			<p>We retain your data for as long as you maintain an active account with us, plus:</p>,
			<ul>
				<li>For inactive accounts: 90 days after your last login or activity</li>
				<li>For closed accounts: 30 days after account closure</li>
				<li>For trial accounts that don't convert: 30 days after trial expiration</li>
			</ul>,
			<p>After these periods, your personal data is permanently deleted from our systems.</p>,

			<h2>Your GDPR Rights</h2>,
			<p>Under GDPR, you have the right to:</p>,
			<ul>
				<li>
					<strong>Access</strong> your personal data
				</li>
				<li>
					<strong>Rectify</strong> inaccurate or incomplete data
				</li>
				<li>
					<strong>Erase</strong> your personal data (the "right to be forgotten")
				</li>
				<li>
					<strong>Restrict</strong> processing of your data
				</li>
				<li>
					<strong>Data portability</strong>: Receive your data in a machine-readable format
				</li>
				<li>
					<strong>Object</strong> to processing based on legitimate interests
				</li>
				<li>
					<strong>Withdraw consent</strong> at any time for activities based on consent
				</li>
			</ul>,
			<p>
				To exercise any of these rights, please contact us at <a href="mailto:privacy@simpleorder.co.uk">privacy@simpleorder.co.uk</a>.
			</p>,

			<h2>Data Transfers</h2>,
			<p>
				Simple Order primarily operates within the UK/EU. Any limited transfers of data outside the UK/EU are protected by appropriate
				safeguards such as Standard Contractual Clauses or adequacy decisions.
			</p>,

			<h2>Third-Party Services</h2>,
			<p>We use a limited number of third-party services essential to our operations:</p>,
			<ul>
				<li>
					<strong>Mailgun</strong>: For sending transactional emails
				</li>
				<li>
					<strong>Neon</strong>: For database hosting
				</li>
				<li>
					<strong>Fly.io</strong>: For application hosting
				</li>
				<li>
					<strong>Stripe</strong>: For subscription payments
				</li>
			</ul>,
			<p>All third-party providers are GDPR-compliant and have appropriate data protection measures in place.</p>,

			<h2>Data Breach Procedures</h2>,
			<p>In the unlikely event of a data breach that risks your rights and freedoms, we will:</p>,
			<ol>
				<li>Notify the relevant supervisory authority within 72 hours</li>
				<li>Inform affected users without undue delay</li>
				<li>Document the breach and our response</li>
				<li>Take measures to mitigate any negative consequences</li>
			</ol>,

			<h2>Children's Data</h2>,
			<p>
				Our services are not intended for and not directed at individuals under 18 years of age. We do not knowingly collect personal data
				from children.
			</p>,

			<h2>Cookies Policy</h2>,
			<p>
				We use only essential cookies necessary for the functioning of our service. These cookies do not track you for advertising purposes.
				For more information, please see our <Link href="/cookie-policy">Cookie Policy</Link>.
			</p>,

			<h2>Changes to This Statement</h2>,
			<p>
				We may update this GDPR compliance statement to reflect changes in our practices or for legal reasons. We will notify you of any
				material changes via email or through the platform.
			</p>,

			<h2>Data Protection Officer</h2>,
			<p>
				While not legally required for our organization size, we have designated a Data Protection Officer to oversee our compliance with
				data protection regulations:
			</p>,
			<p>
				Email: <a href="mailto:dpo@simpleorder.co.uk">dpo@simpleorder.co.uk</a>
			</p>,

			<h2>Supervisory Authority</h2>,
			<p>
				If you are not satisfied with our response to any data privacy concern, you have the right to lodge a complaint with the UK
				Information Commissioner's Office (ICO):{' '}
				<a href="https://ico.org.uk/" target="_blank" rel="noopener noreferrer">
					https://ico.org.uk/
				</a>
			</p>,

			<h2>Contact Us</h2>,
			<p>If you have any questions about our GDPR compliance or data protection practices, please contact us at:</p>,
			<p>
				Email: <a href="mailto:privacy@simpleorder.co.uk">privacy@simpleorder.co.uk</a>
			</p>,
			<p>Last updated: 28 April 2025</p>,
		],
	},
	'cookie-policy': {
		utilityPage: true,
		slug: 'cookie-policy',
		displayTitle: 'Cookie policy',
		metaTitle: 'Cookie policy | Simple Order wholesale order management',
		displayDescription:
			'Simple Order respects your privacy and only uses essential cookies that our wholesale order platform needs to function.',
		metaDescription:
			'Simple Order cookie policy - we only use essential cookies required for our wholesale order management platform functionality.',
		featuredImage: imagesCollection.furnitureManufacturer,
		category: articleCategories.legal,
		publishedAt: createDate(29, february, 2025),
		content: [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',

			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		],
	},
	'privacy-policy': {
		utilityPage: true,
		slug: 'privacy-policy',
		displayTitle: 'Privacy policy',
		metaTitle: 'Privacy policy | Simple Order wholesale order management',
		displayDescription:
			'How Simple Order collects, processes, and protects your data while providing our wholesale order management service. Your privacy matters to us.',
		metaDescription:
			'The Simple Order privacy policy explains how we handle your data - your rights, our security measures, and data protection compliance.',
		featuredImage: imagesCollection.default,
		category: articleCategories.legal,
		publishedAt: createDate(5, february, 2025),
		content: [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',

			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		],
	},
	'terms-of-service': {
		utilityPage: true,
		slug: 'terms-of-service',
		displayTitle: 'Terms of service',
		metaTitle: 'Terms of service | Simple Order wholesale order management',
		displayDescription:
			'The agreement between Simple Order and users of our wholesale order management platform. Review our terms before using our service.',
		metaDescription:
			'Simple Order terms of service - the rules and conditions for using our wholesale order management platform - pricing, refund policy, user responsibilities.',
		featuredImage: imagesCollection.autoParts,
		category: articleCategories.legal,
		publishedAt: createDate(5, february, 2025),
		content: [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',

			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
		],
	},
}
