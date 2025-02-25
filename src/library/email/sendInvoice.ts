import type { DangerousBaseUser } from '@/types'
import axios from 'axios'
import type Stripe from 'stripe'
import { bareLaunchedDomain, siteIsLaunched } from '../environment/publicVariables'
import { myPersonalEmail } from '../environment/serverVariables'
import logger from '../logger'
import emailClient from './client'

export async function sendInvoiceEmail(user: DangerousBaseUser, invoice: Stripe.Invoice): Promise<boolean> {
	// ToDo: Change to receipt/invoice like Anthropic

	try {
		const invoiceUrl = invoice.invoice_pdf
		if (!invoiceUrl) {
			logger.error('No invoice PDF URL available')
			return false
		}

		let pdfBuffer: Buffer
		try {
			const response = await axios.get(invoiceUrl, {
				responseType: 'arraybuffer',
				timeout: 10000,
			})
			pdfBuffer = Buffer.from(response.data)
			logger.info('PDF downloaded successfully')
		} catch (error) {
			logger.error('Error downloading PDF: ', error)
			return false
		}

		const invoiceNumber = invoice.number
		const amount = (invoice.amount_paid / 100).toFixed(2)
		const currency = invoice.currency.toUpperCase()

		const recipientEmail = siteIsLaunched ? user.email : myPersonalEmail

		await emailClient.messages.create(bareLaunchedDomain, {
			from: 'Simple Order <noreply@simpleorder.co.uk>',
			to: recipientEmail,
			subject: `Simple Order Invoice #${invoiceNumber}`,
			text: `Dear ${user.firstName},\n\nThank you for your payment of ${currency} ${amount}. Your subscription is now active.\n\nPlease find your invoice attached.\n\nRegards,\nThe Simple Order Team`,
			html: `
        <p>Dear ${user.firstName},</p>
        <p>Thank you for your payment of ${currency} ${amount}. Your subscription is now active.</p>
        <p>Please find your invoice attached.</p>
        <p>Regards,<br>The Simple Order Team</p>
      `,
			attachment: [
				{
					data: pdfBuffer,
					filename: `Invoice-${invoiceNumber}.pdf`,
					contentType: 'application/pdf',
				},
			],
		})

		if (siteIsLaunched) {
			logger.info(`Invoice email sent to ${recipientEmail}`)
		} else {
			logger.info(`Diverted invoice email from ${user.email} to ${myPersonalEmail}`)
		}

		return true
	} catch (error) {
		logger.error('Error sending invoice email', error)
		return false
	}
}
