1. CREATE INVITATION

- ~~Must be signed in merchant with subscription~~
- ~~Takes email address to invite~~
- Check customer_relationships for existing relationship
- Check invitations for existing invitation
  - `Logic for re-sending emails...`
- Generate unique 7-day token
- Saves to invitations table
- Sends email with acceptance link containing token
  - Merchant details
  - Confirmation link
  - Simple Order logo & one-liner

# Logic for re-sending emails

- Send a maximum of 5 emails
  - Send first instantly
  - Second after 15 minutes
  - third after another 15 minutes
  - fourth after another hour
  - final after another 24 hours
