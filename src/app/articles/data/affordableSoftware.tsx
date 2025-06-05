import { may } from '@/library/constants'
import { useCases } from '@/library/constants/tsx'
import { defaultImage } from '@/library/imagesCollection'
import { createDate } from '@/library/shared'
import { formattedSubscriptionPrice } from '@/library/utilities/public'
import { getUseCaseWordForms } from '@/library/utilities/public/definitions/getUseCaseWordForms'
import { type ArticleDetails, UseCase, articleCategories } from '@/types'
import { optimiseDescription, optimiseTitle } from 'string-optimiser'

type Props = Pick<ArticleDetails, 'publishedAt'> & UseCase

/*
   alternates: {
      canonical: isDefault 
        ? `/articles/${params.slug}`  // Clean URL for GBP
        : `/articles/${currency}/${params.slug}` // Explicit for others
    }

languages: {
    'en-GB': `/articles/${slug}`,
    'en-US': `/articles/usd/${slug}`,
    'en-CA': `/articles/cad/${slug}`,
  }
  */

function generateAffordableSoftwareArticle({ publishedAt, ...useCase }: Props): Record<string, ArticleDetails> {
	const {
		lowercaseBusiness,
		industry,
		lowercaseIndustry,
		industries,
		lowercaseIndustries,
		lowercasePeople,
		slugShort,
		activity,
		lowercaseActivity,
	} = getUseCaseWordForms(useCase)

	const slug = `affordable-software-for-${slugShort}-orders`

	const shortTitle = `${industry} order management software`
	const displayTitle = `Affordable ${lowercaseIndustry} order management software`

	const metaTitle = optimiseTitle({
		baseOptions: [shortTitle, displayTitle],
		additionalPhraseOptions: ['Simple order'],
	})

	const metaDescription = optimiseDescription({
		baseOptions: [shortTitle, displayTitle],
		additionalPhraseOptions: [
			'Stop taking orders over the phone',
			`Stop taking orders over the phone for ${formattedSubscriptionPrice} per month.`,
			`Stop taking orders over the phone for ${formattedSubscriptionPrice} per month with our simple order management software.`,
		],
	})

	const displayDescription = `How Simple Order can streamline your ${lowercaseBusiness} by replacing phone orders with a simple online ordering system.`

	const content: ArticleDetails['content'] = [
		`If you're running a ${lowercaseBusiness} and tired of managing orders through phone calls, texts, and scraps of paper, you're not alone. Many ${lowercasePeople} struggle with keeping track of orders, particularly as their businesses grow.`,
		<h2>The problem with manual order management</h2>,
		`Most ${lowercaseIndustries} start by taking orders through:`,
		<ul>
			<li>Phone calls</li>
			<li>Text messages</li>
			<li>WhatsApp</li>
			<li>Email</li>
			<li>Written notes</li>
		</ul>,
		'This works when you have a few orders per week, but quickly becomes overwhelming. Common problems include:',
		<ul>
			<li>Forgetting order details</li>
			<li>Double-booking dates</li>
			<li>Losing customer information</li>
			<li>Spending hours on admin instead of {activity}</li>
			<li>Difficulty tracking what's been paid</li>
		</ul>,
		<h2>Why Simple Order works for {industries.toLowerCase()}</h2>,
		'Simple Order is designed specifically for businesses like yours - small wholesalers who already have established customers and want to stop taking orders over the phone.',
		<h2>What Simple Order does</h2>,
		<ul>
			<li>
				<strong>Online ordering website</strong> where your customers can place orders at their convenience
			</li>
			<li>
				<strong>Order management</strong> so you can see all incoming orders in one place
			</li>
			<li>
				<strong>Customer invitation system</strong> to keep your existing customers private
			</li>
			<li>
				<strong>Holiday settings</strong> so customers can't order when you're not delivering
			</li>
		</ul>,
		<h2>{`What Simple Order Doesn't Do (And Why That's Good)`}</h2>,
		"Unlike expensive competitors, Simple Order deliberately doesn't handle:",
		<ul>
			<li>
				<strong>Payments</strong> - Most {lowercaseIndustries} use direct debits or get paid on delivery anyway
			</li>
			<li>
				<strong>Deliveries</strong> - You know your routes better than any software
			</li>
			<li>
				<strong>Accounting</strong> - You probably already have a system that works
			</li>
		</ul>,
		<p>This keeps the price at just {formattedSubscriptionPrice} per month instead of £80-150 that other solutions charge.</p>,
		<h2>How It Solves Your Daily Problems</h2>,
		<strong>Before Simple Order:</strong>,
		<ul>
			<li>Customers call during the day, interrupting your work</li>
			<li>You forget order details or lose written notes</li>
			<li>Customers call to check if you got their order</li>
			<li>You spend evenings writing up order lists</li>
		</ul>,
		<strong>After Simple Order:</strong>,
		<ul>
			<li>Customers place orders online when it's convenient for them</li>
			<li>All orders are automatically recorded with full details</li>
			<li>You can check orders anytime from your phone or computer</li>
			<li>Order confirmation happens automatically</li>
		</ul>,
		<h2>Perfect for UK {industries}</h2>,
		'Simple Order is built specifically for the UK market:',
		<ul>
			<li>All pricing in pounds</li>
			<li>Times in GMT/BST</li>
			<li>Designed around how UK small businesses actually work</li>
			<li>No unnecessary features that drive up costs</li>
		</ul>,
		<h2>Getting Started</h2>,
		<p>
			<strong>Free 30-day trial</strong> - no card details required. Set up your products, invite a few regular customers, and see how it
			works with your business.
		</p>,
		<strong>Simple setup:</strong>,
		<ol>
			<li>Add your products with descriptions and prices</li>
			<li>Set your available days and holidays</li>
			<li>Invite your existing customers via email</li>
			<li>Start receiving orders online instead of over the phone</li>
		</ol>,
		<h2>{`Who It's For`}</h2>,
		'Simple Order works best if you:',
		<ul>
			<li>Already have regular customers who order from you</li>
			<li>Take orders over the phone or WhatsApp currently</li>
			<li>Want to save time on order management</li>
			<li>Don't need complex features like accounting or delivery management</li>
			<li>Want something affordable (under £20/month)</li>
		</ul>,
		<h2>The Bottom Line</h2>,
		"Simple Order does one thing really well: it lets your existing customers place orders online so you don't have to answer the phone all the time. No payment processing, no delivery management, no accounting - just simple order management that works.",
		`Most ${lowercasePeople} save 5-10 hours per week by switching from phone orders to Simple Order. That's time you can spend ${lowercaseActivity}, with family, or growing your business.`,
	]

	return {
		[slug]: {
			programmatic: true,
			slug,
			displayTitle,
			metaTitle,
			metaDescription,
			displayDescription,
			publishedAt: publishedAt,
			featuredImage: useCase.featuredImage || defaultImage,
			category: articleCategories.useCases,
			content,
		},
	}
}

export const affordableSoftwareArticles = Object.values(useCases).map((useCase) =>
	generateAffordableSoftwareArticle({
		publishedAt: createDate(27, may, 2025),
		...useCase,
	}),
)
