# Accounts & Invitations E2E Test Sequence Flows

## Basic sign-up

1. ~~Delete merchant@gmail.com from the database~~
2. ~~Merchant fills out form~~
3. Account creation notification
4. ~~Merchant is redirected to /dashboard~~
5. ~~It says 'Please confirm your email'~~
6. MenuBar says 'Test Merchant'
7. ~~Click the email link~~
8. Notification says 'Email confirmed'
9. Go to dashboard
10. Go to /account
11. Click delete account
12. Notification says 'Account deleted'
13. Redirected to homepage
14. Check cookie has been deleted
15. Check database for entries

## Invitation sequence

15. Merchant signs up
16. Merchant confirms their email
17. Merchant invites Both as a customer
18. Both accepts & confirms their email by clicking the link
19. Both is prompted to make a new account and does so
20. Merchant invites my existing account as a customer
21. I click the link to accept
22. Both starts a free trial as a merchant too
23. Both also invites me as a customer

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
