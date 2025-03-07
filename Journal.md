# Coding journal

## Wednesday 26 February 2025

-  Tried Claude Code (command line AI bot that can read the whole code base). It's pretty cool and quite terrifying but not incredible. Yet.
-  Created illegal character feedback on the Add to Inventory form
-  Made InventoryAdminGETresponse much more specific
-  Added data fetching logic to InventoryList
-  Made inventory item skeleton
-  Created UserInformation.tsx
-  Fixed weird container padding issue
-  Worked on customer fetching logic
-  Made dynamic Orders title
-  Made OrdersReceived and OrdersMade components
-  Fixed issues with empty inventory arrays being treated as truthy
-  Split up operations.ts into separate files
-  Made invitations RESTful
-  Lot of work on invitations system front-end
-  A load of other stuff I forgot to write about

## Thursday 27 February

-  Retrieved the merchant name from `api/inventory/merchants/[merchantSlug]` instead of a dedicated route for convenience
-  Fixed controlled component type issue with AddInventoryForm
-  Finally displayed the customer's view of a merchant's products on their slug page!
-  Added breadcrumbs to the customer's view of the merchant's products
-  Made Breadcrumbs component reusable (articles, merchants etc.)
-  Updated the default user state to use empty arrays instead of null
-  Worked on /dashboard page, getting it to fetch initial data

## Friday 28 February

-  Added placeholder privacy policy, cookie policy, terms of service, and GDPR compliance pages
-  Updated article sorting so these pages are in the blog but always at the end
-  Updated the articles breadcrumbs
-  Updated the menu bar so that the active link is highlighted even if you're on a subpage
-  Created a footer
-  Sorted out a load of type issues where I hadn't updated the entire site
-  Changed user provider back to having null instead of empty arrays as the default
   -  My approach now is to nullify all empty arrays at the source (i.e. Drizzle queries with no results)
-  Prevented a load of routes from returning empty arrays
-  Restructured the site in a big way!
   -  I removed /merchants as it's confusing. Now, customers go to /orders, where there's a list of merchants they're subscribed to
-  Made Customer/Merchant-facing order pages

## Saturday 29 February

-  Prevented /api/inventory/merchants/[merchantSlug] GET from returning empty arrays
-  Working on a root-level BreadCrumbs component as I want this on every page except the home page
-  Created /api/invitations GET route to retrieve pending invitations for the signed-in customer

## Monday 3 March (My birthday!)

-  Created API details file in Notion to keep track of work I need to do on the API in detail
-  Created meta to-do list to print out and keep me on track, focussing on functionality
-  Sorted out apiPaths
-  Worked on new /api/relationships route
-  Deleted unnecessary merchant_profiles table as I was only using it for the slug. All users now get a slug on sign-up, whether they need it or not, as this makes everything much simpler
-  Fixed the composite index on relationships
-  Updated create-account to add the slug to the users table
-  Fixed /api/invitations/[token] just about... it's still a mess though!
-  Created new /api/relationships route, which works beautifully and is very lovely code
-  Updated user provider
-  Sorted out initial data fetch
-  Turned customer-facing inventory list into a controlled form
-  Coded until 10pm in a flow state so did loads of other stuff I forgot to record
-  Created route to create a new order using fully normalised tables

## Tuesday 4 March

-  Researched UK VAT guidelines for rounding
-  Created orders/admin GET route
-  Figured out how to join and shape the orders data
-  Fixed problem with new order page using strings instead of numbers
-  Created OrderSummary.tsx
-  Started data fetching for merchant-facing orders

## Wednesday 5 March

-  Added requested delivery date when creating new order
-  Fixed errors in accept invitations route
-  Lots of work on accepting invitations UX
-  Fixed logic for displaying no customers message, confirm your email message, no inventory message
-  Pushed new invitation to state on send
-  Fixed on Invitations GET route
-  Added invitations data fetching to user provider
-  Fixed errors until Next build worked again

## Thursday 6 March

-  Wasted loads of time trying to fix my test suite
-  Got really annoyed with it and deleted it all. Will try again with different browser automation software another time
-  Added detailed logging to many routes
-  Added a mobile menu
-  Worked on add inventory form controlled component issues
-  Started to deploy the site for testing on actual devices

## Friday 7 March

-  Added BIMI logo
-  Sorted out Dockerfile
-  Set up Neon database
-  Deployed with live database!
