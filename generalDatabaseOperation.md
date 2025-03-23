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
export async function generalDatabaseOperation({
	request,
	routeDetail,
	requireConfirmed = true,
	requireSubscriptionOrTrial = false,
	checkRoles = false,
	checkRelationship = null,
}) {
	const { extractedUserId } = await extractIdFromRequestCookie(request);
	if (!extractedUserId)
		return { success: false, message: 'Not authenticated' };

	const [foundUser] = await database
		.select()
		.from(users)
		.where(equals(users.id, extractedUserId));
	if (!foundUser) return { success: false, message: 'User not found' };

	if (requireConfirmed && !foundUser.emailConfirmed) {
		return { success: false, message: 'Email not confirmed' };
	}

	let hasActiveSubscription = false;
	if (requireSubscriptionOrTrial) {
		// Check cached trial status
		if (!foundUser.cachedTrialExpired) {
			hasActiveSubscription = true; // What???? ToDo
		} else {
			const [validFreeTrial] = await database
				.select()
				.from(freeTrials)
				.where(
					and(
						greaterThan(freeTrials.endDate, new Date()),
						equals(freeTrials.userId, foundUser.id)
					)
				);

			if (!validFreeTrial) {
				const [validSubscription] = await database
					.select()
					.from(subscriptions)
					.where(
						and(
							greaterThan(subscriptions.currentPeriodEnd, new Date()),
							equals(subscriptions.userId, foundUser.id)
						)
					);

				hasActiveSubscription = Boolean(validSubscription);
			} else {
				hasActiveSubscription = true;
			}
		}

		if (!hasActiveSubscription) {
			return { success: false, message: 'No active subscription or trial' };
		}
	}

	let userRole = undefined;
	if (checkRoles) {
		const { userRole: role } = await getUserRoles(foundUser);
		userRole = role;
	}

	let relationshipStatus = undefined;
	if (checkRelationship) {
		const { relationshipExists } = await checkRelationship({
			merchantId: userRole === 'merchant' ? foundUser.id : checkRelationship,
			customerId: userRole === 'customer' ? foundUser.id : checkRelationship,
		});
		relationshipStatus = relationshipExists;
	}

	return {
		success: true,
		user: foundUser,
		hasActiveSubscription,
		userRole,
		relationshipStatus,
	};
}
```

## Benefits

This implementation allows you to:

1. Perform common authentication checks
2. Optionally verify subscription status
3. Optionally get user roles
4. Optionally check relationships
5. Optionally retrieve relevant data in one operation

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
