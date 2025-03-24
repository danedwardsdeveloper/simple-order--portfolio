# General Database Operation

## Tables to check in sequence

1. `users` - authenticate user from token
2. `freeTrials`/`subscriptions` - check subscription status
3. `relationships`/`invitations` - verify merchant/customer relationships
4. `products`/`orders`/`orderItems` - retrieve relevant data

## Common checks in order

1. Extract userId from cookie
2. Verify user exists
3. Check if email is confirmed (optional)
4. Check subscription/trial status (optional)
5. Get user roles (merchant/customer/both)
6. Check relationships (optional)
7. Validate request data based on role
8. Retrieve relevant data based on role and request

## Implementation suggestion

```typescript

```

## Benefits

This implementation allows you to:

1. Perform common authentication checks
2. Optionally verify subscription status
3. Optionally get user roles
4. Optionally check relationships

You can use it with different parameter combinations depending on what each route needs. This will help reduce duplicate database queries across your API routes.

## Example Usage

```typescript
// Basic authentication with no extra checks
const { success, user, message } = await generalDatabaseOperation({
	request,
	routeDetail: 'GET /api/some-endpoint',
});

// Authentication + subscription check + role check
const { success, user, hasActiveSubscription, userRole } =
	await generalDatabaseOperation({
		request,
		routeDetail: 'POST /api/inventory',
		requireSubscriptionOrTrial: true,
		checkRoles: true,
	});

// Full check including relationship and data retrieval
const {
	success,
	user,
	userRole,
	relationshipStatus,
	ordersPlaced,
	ordersReceived,
} = await generalDatabaseOperation({
	request,
	routeDetail: 'GET /api/orders',
	checkRoles: true,
	checkRelationship: merchantId,
	retrieveData: {
		orders: true,
	},
});
```
