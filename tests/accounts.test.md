# Accounts & Invitations E2E Test Sequence Flow

1. John signs up
2. John confirms his email
3. John invites Susie as a customer
4. Susie accepts & confirms her email by clicking the link
5. Susie is prompted to make a new account and does so
6. John invites my existing account as a customer
7. I click the link to accept
8. Susie starts a free trial as a merchant too
9. Susie also invites me as a customer

## Straightforward sign up flow with no edge cases

1. Delete `test@gmail.com` from the database
2. Go to `/free-trial`, fill out the form, click submit
3. Should redirect to `/dashboard`
4. Should say 'Please confirm your email address'
5. Check the free_trials table and log the end date
6. Click the link logged to `test-email-inbox.json`
7. Should say 'Email confirmed && Should not say 'Please confirm your email'
8. Check that the database has updated
   - More tests here!
9. Go to `/settings` and click Delete account
10. Click the confirmation modal
11. Should say 'Account deleted'
12. Check users, merchant_profiles, free_trials, & confirmation_tokens for references

## Invite customer who hasn't used the site before

1. Delete `test-customer@gmail.com` from users & confirmation_tokens & relationships?
2. Go to `/dashboard` and click 'Invite customer' (Merchant browser)
3. Enter `test-customer@gmail.com` and click 'Send invitation'
4. Refresh the page. Should say `test-customer@gmail.com awaiting confirmation`
5. Check the database has a token
6. Click the link logged to `test-email-inbox.json` in a different browser (Customer browser)
7. Should display a new customer form - fill it out, click submit
8. Should display a welcome message && have 'Test merchant' listed under 'Merchants'
9. Check email was actually confirmed in the database
10. Merchant browser - refresh the page. Email should be listed under 'Confirmed customers'
11. Check merchant/customer database row exists and is correct
12. Customer browser - delete account
