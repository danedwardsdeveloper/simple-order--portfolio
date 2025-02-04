import formData from 'form-data'
import Mailgun from 'mailgun.js'

import { mailgunKey } from '@/library/environment/serverVariables'

const mailgun = new Mailgun(formData)

const emailClient = mailgun.client({
  username: 'api',
  key: mailgunKey,
  url: 'https://api.eu.mailgun.net',
})

export default emailClient
