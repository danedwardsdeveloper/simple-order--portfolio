# Trigger webhook events with the CLI

stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted

Look at the events data on the Stripe Dashboard!

# Create a test customer

stripe customers create --name="Test Customer" --email="test@example.com"

# Create a subscription using that customer ID

stripe subscriptions create --customer=cus_123ABC --items[0][price]=price_123ABC

# Events

These webhook events are triggered when you pay for a subscription for the first time:
`invoice.paid` // This is the important one with all the useful information

'payment_intent.succeeded'
'invoice.created'
'customer.subscription.created'
'payment_intent.created'
'charge.succeeded'
'invoice.finalized'
'customer.subscription.updated'
'customer.updated'
'invoice.updated'
'customer.created'
'checkout.session.completed'
'payment_method.attached'
'invoice.payment_succeeded'

# Trigger a test subscription

stripe trigger customer.subscription.created \
 --override customer:name="Test Customer" \
 --override customer:email="test@example.com" \
 --override subscription:metadata:source="website" \
 --override subscription:"items[0][price]"=price_YOUR_PRICE_ID

# Situations I need to handle

customer.subscription.created - To record when someone subscribes and grant them access
customer.subscription.deleted - To record when someone cancels and revoke their access

The customer.subscription.updated event would only be relevant in a few specific cases:

-  If a subscription goes into a past_due status due to failed payment
-  If a customer pauses their subscription
-  If a customer changes their billing cycle date
