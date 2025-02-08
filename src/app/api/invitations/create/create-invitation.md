## Create invitation

1. Check email has been provided
2. Check email format is correct
3. Check user is signed in
4. Check user has confirmed their email
5. Check for active trial/subscription

6. Check if the invitee has a user row
7. If they do, get the userId (inviteeUserId)
8. If they do, check `customer_relationships` for a relationship

9. Check for existing relationship
10. Check `invitations` for existing invitation
    // Enhancement for later: resend email logic
11. Transaction: create new invitation row
12. Transaction: send confirmation email

## Email content

- Merchant details
- Confirmation link
- Expiration time/date
- Simple Order logo & one-liner
- If you didn't request this, you can safely ignore it
- Contact support info
- Unsubscribe link (may be legally required in some regions)
