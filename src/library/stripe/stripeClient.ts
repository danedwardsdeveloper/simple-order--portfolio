import Stripe from 'stripe'
import { stripeTestKey } from '../environment/serverVariables'

const stripeClient = new Stripe(stripeTestKey)

export default stripeClient
