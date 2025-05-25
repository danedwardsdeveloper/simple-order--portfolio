export const dataTestIdNames = {
	createAccountFirstNameInput: 'create-account-first-name-input',
	createAccountLastNameInput: 'create-account-last-name-input',
	createAccountBusinessNameInput: 'create-account-business-name-input',
	createAccountEmailInput: 'create-account-email-input',
	createAccountPasswordInput: 'create-account-password-input',
	createAccountSubmitButton: 'create-account-submit-button',
	pleaseConfirmYourEmailMessage: 'please-confirm-your-email-message',
	emailConfirmationFeedback: 'email-confirmation-feedback',
	emailConfirmation: {
		// ToDo: Remove these. Check for a notification instead
		loading: 'confirm-page-loading-message',
		default: 'confirm-page-default-message',
		response: 'confirm-page-response-message',
	},
	signIn: {
		emailInput: 'sign-in-email-input',
		passwordInput: 'sign-in-password-input',
		submitButton: 'sign-in-submit-button',
	},
	invite: {
		form: 'invite-customer-form',
		emailInput: 'invite-customer-email-input',
		submitButton: 'invite-customer-submit-button',
		response: 'invite-customer-response-message',
		loading: 'invite-customer-loading-message',
	},
	account: {
		signOutButton: 'sign-out-button',
	},
	inventory: {
		deleteProductModal: 'delete-product-modal',
	},
} as const
