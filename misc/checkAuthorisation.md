# Check authorisation requirements

- ~~get the ID using extractIdFromToken~~
- Find the user in the database
- Check their email is confirmed (optional)
- Check their free trial / subscription is active (optional)

# 🚫 Inappropriate scenarios

- Sign in (Only one interaction - find user in database)
- Create account (Unique transaction pattern)
- Accept invitation (Security through proof of possession)
- Sign out (Not protected - just deletes cookies on the browser)
- Delete account (confirmed email and active subscription not required)

# ✅ Appropriate scenarios

### Scenarios requiring two or more interactions with the database

- User must exist 🟢
- Email must always be confirmed 🟢
- Subscription may or may not be required 🟡

- Customers creating/amend/delete an order
- Retrieve order(s) (Merchants)
  - Email must be confirmed
  - Subscription must be active
- Merchant sending invitation to customer
  - Email must be confirmed
  - Subscription must be active
- Customer making an order
  - Email has to be confirmed
  - Subscription not required
