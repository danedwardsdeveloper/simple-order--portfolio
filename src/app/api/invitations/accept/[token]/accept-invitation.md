# Invitations/Accept POST

This route can create an account but it's quite different, as this account will be for a customer. Also, they may already have an account, in which case it's much simpler.

- ~~Check if details have been provided~~
- ~~All/nothing details provided!~~
  Validate & sanitise the new account details in the body, if provided
- ~~Get the token from URL~~
- ~~Check the token format is valid~~
- ~~Check token is in invitations table, retrieve the email~~
- Check token is in date
- Delete the expired row if found
- ~~Check email exists in users~~
- Check relationship doesn't exist (Delete the invitation, and return 200 'relationship exists' if it does)
- Create the relationship
- Sign the user in with a session
- If registered:
  - Transaction: change user table emailConfirmed to true if not already
    - Transaction: Create the relationship
    - Transaction: Delete invitation
  - Return 201
- If not registered:
  - ~~If no additional details provided, return 422 'please provide details'~~
  - `If details are provided`
    - Transaction: Create user with emailConfirmed=true
    - Transaction: Create relationship
    - Transaction: Delete invitation
    - Transaction: Send welcome email
    - Create the sign-in cookie
    - `Return 201`
