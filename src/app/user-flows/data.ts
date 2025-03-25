export type StepType = 'user' | 'system' | 'email' | 'notification'

export interface FlowStep {
	title: string
	type: StepType
	subSteps?: string[]
	completed: boolean
	notes?: string
}

export interface Flow {
	title: string
	steps: FlowStep[]
}

export const userFlows: Flow[] = [
	{
		title: 'New free trial',
		steps: [
			{
				title: "User clicks 'Start free trial'",
				type: 'user',
				completed: false,
			},
			{
				title: 'Registration form is displayed',
				type: 'system',
				completed: false,
				notes: 'Form validation could be better. Password requirements, illegal characters etc.',
			},
			{
				title: 'User fills out and submits registration form',
				type: 'user',
				completed: false,
			},
			{
				title: 'Confirmation email sent',
				type: 'email',
				completed: false,
			},
			{
				title: 'Dashboard displayed',
				type: 'system',
				subSteps: ['Can add items to their inventory straight away', 'Must confirm their email before inviting customers'],
				completed: false,
			},
			{
				title: 'User confirms their email',
				type: 'user',
				completed: false,
				notes: 'UX could be better',
			},
			{
				title: 'Notification displayed',
				type: 'notification',
				subSteps: ['"Thank you for confirming your email - you can now invite your customers."', 'Message asking to confirm email is gone'],
				completed: false,
			},
			{
				title: 'Time remaining on free trial is displayed',
				type: 'system',
				completed: false,
			},
		],
	},
	{
		title: 'Invite a customer',
		steps: [
			{
				title: 'Form displayed at /invitations',
				type: 'system',
				completed: false,
			},
			{
				title: 'Merchant fills and submits form',
				type: 'user',
				completed: false,
			},
			{
				title: 'Notification created on success',
				type: 'notification',
				subSteps: ['Wait for invited customer to accept the invitation', 'Pending invitations are displayed on the /customers page'],
				completed: false,
			},
			{
				title: 'Email received when invited customer accepts',
				type: 'email',
				completed: false,
			},
			{
				title: 'Invited customer now listed under "Confirmed Customers" on the /customers page',
				type: 'system',
				completed: false,
			},
		],
	},
	{
		title: 'Pay for subscription',
		steps: [
			{
				title: 'Click button',
				type: 'user',
				subSteps: [
					'Merchant is getting value out of the free trial and wants to pay for a subscription',
					'Button present at /account',
					'Not sure of the CTA wording yet',
					'Also needs to display details about pricing and limitations',
				],
				completed: false,
			},
			{
				title: 'Redirect to Stripe',
				type: 'system',
				subSteps: ['User is redirected to Stripe-hosted checkout page', 'User pays for subscription'],
				completed: false,
			},
			{
				title: 'Redirected back to site',
				type: 'notification',
				subSteps: [
					'Merchant is redirected back to simpleorder.co.uk/accounts',
					'Notification thanks them for their subscription and says that the invoice and receipt has been emailed to them',
				],
				completed: false,
			},
			{
				title: 'invoice and receipt',
				type: 'email',
				subSteps: ["An email with the invoice and receipt PDFs are sent to the merchant's email"],
				completed: false,
			},
			{
				title: 'Subscription details',
				type: 'system',
				subSteps: ['Details of the next payment are displayed at /account'],
				completed: false,
			},
			{
				title: 'Manage subscription button',
				type: 'system',
				subSteps: ['A button is present at /account for the merchant to manage their subscription'],
				completed: false,
			},
		],
	},
	{
		title: 'New user receives invitation',
		steps: [
			{
				title: 'New user receives an invitation from a merchant with a link',
				type: 'email',
				subSteps: [
					"The email explains Simple Order, as this is the customer's first interaction with the brand",
					'Email wording needs refinement',
				],
				completed: false,
			},
			{
				title: 'New user clicks the link in the email, which takes them to /accept-invitation/[token]',
				type: 'user',
				completed: false,
			},
			{
				title: 'Complete registration',
				subSteps: [
					'A form asks for more details to complete the registration',
					"This new user doesn't have to confirm their email as they've just done that already",
				],
				type: 'system',
				completed: false,
			},
			{
				title: 'Success notification',
				subSteps: [
					'Redirects to /dashboard',
					'A notification thanks the user for signing up.',
					"The merchant who just invited them is listed, and there's an obvious button to create a new order from them",
				],
				type: 'notification',
				completed: false,
			},
		],
	},
	{
		title: 'Existing user receives an invitation',
		steps: [
			{
				title: ' Existing user receives an invitation',
				type: 'email',
				completed: false,
			},
			{
				title: 'Existing user clicks the link in the email, which takes them to /accept-invitation/[token]',
				type: 'user',
				completed: false,
			},
			{
				title: 'Success notification',
				subSteps: [
					'Redirects to /dashboard',
					'A notification congratulates the user for becoming a customer of the merchant',
					"The merchant who just invited them is listed, and there's an obvious button to create a new order from them",
				],
				type: 'notification',
				completed: false,
			},
		],
	},
	{
		title: 'Cancel subscription',
		steps: [
			{
				title: "Press 'Manage subscription' button",
				type: 'user',
				completed: false,
			},
			// ToDo
		],
	},
	{
		title: 'Create an order',
		steps: [
			{
				title: "User clicks a 'New order' button",
				type: 'user',
				completed: false,
			},
			// ToDo
		],
	},
	{
		title: 'Mark an order as completed',
		steps: [
			{
				title: 'Merchant clicks the order status dropdown',
				type: 'user',
				completed: false,
			},
			// ToDo
		],
	},
]
