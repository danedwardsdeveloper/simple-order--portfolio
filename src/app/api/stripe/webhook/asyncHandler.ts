// let subscription
// let status
// // Handle the event
// switch (event.type) {
//     case 'customer.subscription.trial_will_end':
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription trial ending.
//         // handleSubscriptionTrialEnding(subscription);
//         break
//     case 'customer.subscription.deleted':
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription deleted.
//         // handleSubscriptionDeleted(subscriptionDeleted);
//         break
//     case 'customer.subscription.created':
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription created.
//         // handleSubscriptionCreated(subscription);
//         break
//     case 'customer.subscription.updated':
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription update.
//         // handleSubscriptionUpdated(subscription);
//         break
//     case 'entitlements.active_entitlement_summary.updated':
//         subscription = event.data.object
//         console.log(`Active entitlement summary updated for ${subscription}.`)
//         // Then define and call a method to handle active entitlement summary updated
//         // handleEntitlementUpdated(subscription);
//         break
//     default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`)
// }
