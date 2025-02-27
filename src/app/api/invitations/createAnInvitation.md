# Invite customer route

```txt
1. Check the email has been provided/
   └── 400 bad request
2. Check email format/
   └── 400 bad request
3. Normalise email
4. Check for valid token/
   └── 401 unauthorised
5. Check user exists and emailConfirmed/
   └── 401 unauthorised
6. Prevent merchants from inviting themselves!
6. Check user has an active subscription or trial/
   └── 401 unauthorised
7. Check if invitee already has an account/
   ├── 8. If so, look for an existing relationship/
   │ └── 202 relationship exists
   ├── 9. Check for an existing invitation
   └── 10. Check existing invitation expiry/
   └── 400 in-date invitation exists
8. Transaction: Delete expired invitation if it exists
9. Transaction: create a new invitation row
10. Transaction: if a test, record the email in test_email_inbox
11. Transaction: send the invitation email
12. Add details to client customersAsMerchant state

```
