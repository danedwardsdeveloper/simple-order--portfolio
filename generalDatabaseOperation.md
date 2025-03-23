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
  checkRelationshipWith = null, // Optional merchantId or customerId to check relationship with
  retrieveData = { // Optional data to retrieve
    orders: false,
    products: false,
  }
}) {
  // 1. Basic authentication
  const { extractedUserId } = await extractIdFromRequestCookie(request)
  if (!extractedUserId) return { success: false, message: 'Not authenticated' }
  
  // 2. Verify user exists
  const [foundUser] = await database.select().from(users).where(equals(users.id, extractedUserId))
  if (!foundUser) return { success: false, message: 'User not found' }
  
  // 3. Check email confirmation if required
  if (requireConfirmed && !foundUser.emailConfirmed) {
    return { success: false, message: 'Email not confirmed' }
  }
  
  // 4. Check subscription/trial if required
  let hasActiveSubscription = false
  if (requireSubscriptionOrTrial) {
    // Check cached trial status
    if (!foundUser.cachedTrialExpired) {
      hasActiveSubscription = true
    } else {
      // Check free trial
      const [validFreeTrial] = await database
        .select()
        .from(freeTrials)
        .where(and(
          greaterThan(freeTrials.endDate, new Date()),
          equals(freeTrials.userId, foundUser.id)
        ))
      
      // Check subscription if no valid trial
      if (!validFreeTrial) {
        const [validSubscription] = await database
          .select()
          .from(subscriptions)
          .where(and(
            greaterThan(subscriptions.currentPeriodEnd, new Date()), 
            equals(subscriptions.userId, foundUser.id)
          ))
        
        hasActiveSubscription = Boolean(validSubscription)
      } else {
        hasActiveSubscription = true
      }
    }
    
    if (!hasActiveSubscription) {
      return { success: false, message: 'No active subscription or trial' }
    }
  }
  
  // 5. Get user roles if required
  let userRole = undefined
  if (checkRoles) {
    const { userRole: role } = await getUserRoles(foundUser)
    userRole = role
  }
  
  // 6. Check relationship if required
  let relationshipStatus = undefined
  if (checkRelationshipWith) {
    const { relationshipExists } = await checkRelationship({
      merchantId: userRole === 'merchant' ? foundUser.id : checkRelationshipWith,
      customerId: userRole === 'customer' ? foundUser.id : checkRelationshipWith
    })
    relationshipStatus = relationshipExists
  }
  
  // 7. Retrieve relevant data if requested
  const retrievedData = {}
  
  if (retrieveData.orders) {
    // Retrieve orders based on user role
    if (userRole === 'merchant' || userRole === 'both') {
      // Get orders received as merchant
      retrievedData.ordersReceived = await database.select().from(orders).where(equals(orders.merchantId, foundUser.id))
    }
    
    if (userRole === 'customer' || userRole === 'both') {
      // Get orders placed as customer
      retrievedData.ordersPlaced = await database.select().from(orders).where(equals(orders.customerId, foundUser.id))
    }
  }
  
  if (retrieveData.products && (userRole === 'merchant' || userRole === 'both')) {
    // Get products if user is a merchant
    retrievedData.products = await database.select().from(products).where(equals(products.userId, foundUser.id))
  }
  
  return {
    success: true,
    user: foundUser,
    hasActiveSubscription,
    userRole,
    relationshipStatus,
    ...retrievedData
  }
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
  routeDetail: 'GET /api/some-endpoint'
})

// Authentication + subscription check + role check
const { success, user, hasActiveSubscription, userRole } = await generalDatabaseOperation({
  request,
  routeDetail: 'POST /api/inventory',
  requireSubscriptionOrTrial: true,
  checkRoles: true
})

// Full check including relationship and data retrieval
const { 
  success, 
  user, 
  userRole, 
  relationshipStatus, 
  ordersPlaced, 
  ordersReceived 
} = await generalDatabaseOperation({
  request,
  routeDetail: 'GET /api/orders',
  checkRoles: true,
  checkRelationshipWith: merchantId,
  retrieveData: {
    orders: true
  }
})
```