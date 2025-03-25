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
				completed: true,
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
				completed: true,
			},
			{
				title: 'Confirmation email sent',
				type: 'email',
				completed: true,
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
				subSteps: ['"Thank you for confirming your email - you can now invite your customers."'],
				completed: false,
			},
			{
				title: 'Message asking to confirm email is gone',
				type: 'system',
				completed: false,
			},
		],
	},
	{
		title: 'Send invitation',
		steps: [
			{
				title: 'Form displayed at /invitations',
				type: 'system',
				completed: true,
			},
			{
				title: 'User fills and submits form',
				type: 'user',
				completed: true,
			},
			{
				title: 'Notification created on success',
				type: 'notification',
				completed: true,
			},
			{
				title: 'Invitee receives email',
				type: 'email',
				completed: false,
				notes: 'Email wording could be better',
			},
			{
				title: 'Invitee clicks the link in the email, which takes them to /accept-invitation/[token]',
				type: 'user',
				completed: true,
			},
			{
				title: 'Process existing users',
				subSteps: ['redirected to /merchants', 'success notification created', 'name of merchant who invited them is displayed'],
				type: 'system',
				completed: true,
			},
			{
				title: 'Process new users',
				subSteps: ['Ask for more details to complete the new registration'],
				type: 'system',
				completed: true,
			},
		],
	},
]
