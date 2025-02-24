# Trigger webhook events with the CLI

stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted

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
