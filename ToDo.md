# To-Do List

## Current Task

-  Write a test for adding items to the inventory
   -  Make it pass

## MVP

-  Make sure all routes are RESTful

-  Fix transaction error handling in `/api/invitations/accept/[token]`

1. Get `verify-token` to return the invited customers details
2. Set up orders

## Refinements 7 extras (even if they're really important)

-  Replace CLSX with tailwindMerge
-  Prevent sign-in from returning dangerous information!
-  Sanitise business names but allow apostrophes
-  Style notification items
-  Resend confirmation emails (invite customer, merchant sign-up)
-  Rate limit the confirmation endpoint by IP
-  Expire unconfirmed accounts after 24-48 hours
-  Add CAPTCHA if you see suspicious patterns of account creation
-  Monitor for unusual spikes in failed confirmation attempts
-  Customise the Stripe product logo - make smaller/use find something better than the logo
