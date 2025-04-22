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
-  Wrote copy for the pricing section
-  Added a links column to the footer
-  Added placeholder articles for /about
-  Styled an article not found page
-  Created a password visibility toggle button for sign-in and free-trial
-  Achieved perfect Lighthouse scores on the homepage
-  Updated email sending logic for production
-  Added social image
-  Took screenshots for project write up

## Monday 11 March

-  Completely forgot about journaling but did a lot of thinking about the UX, and fixed some routes, and created the GET ordersMade route

## Tuesday 12 March

-  Added ordersMade to user provider and fetched data
-  Added ordersReceived to user provider and fetched data
-  Added requestedDeliveryDate to order creation form
-  Added Simple Analytics script
-  Sorted out order fetching from orders pages & components

## Wednesday 13 March

-  Reduced unnecessary requests from user provider with conditional Promise.all
-  Save merchantMode in local storage
-  Fixed mobile panel z-index issues
-  Added mobile panel animations
-  Renamed interfaces, components and pages OrdersReceived and OrdersMade
-  Updated custom logger to handle maps and sets
-  Fixed z-index issues
-  Returned products data from /api/orders

## Thursday 14 March

-  Worded on /api/orders/admin route (now returns correct data)
-  Merged formatting utility files
-  Worked on styling an OrderReceivedCard
-  Created a capitaliseFirstLetter utility
-  Created TwoColumnContainer
-  Created calculateOrderTotal function
-  Worked on `OrderReceived` and /api/orders route so it returns products data with quantities
-  Styled OrderReceivedCard
-  Lots of work on `src/app/api/orders/admin/[orderId]/route.ts` using a new style

# Friday 15 March

-  Checked in code from yesterday
-  Fixed major type issues on `src/app/orders/[merchantSlug]/new/page.tsx`
-  Order creation route now returns OrderMade object, but it's really inefficient so far
-  Created `processDeveloperMessage` function
-  Prevent making orders from your own store
-  Worked on `PATCH /api/orders/admin/[orderId]/route.ts` with new responses system
-  Worked on `PATCH /api/orders/[orderId]/route.ts` with new responses system

# Saturday 16 March

-  More work on `PATCH /api/orders/[orderId]/route.ts`. It's pretty much done except you can't add items that weren't on the original order.
-  Worked on logging system
-  Installed and used ShadCN for the first time
-  Implemented an order status dropdown for merchants! (This was complicated!)

# Sunday 17 March

-  Replaced clsx with mergeClasses
-  Fixed route type errors

# Monday 18 - Wednesday 19 March

-  Had a break. Applied for jobs, deployed ClassicReader.org, practiced and studied algorithms

# Thursday 20 March

-  Organised utilities into folders
-  Re-exported Drizzle utilities with more expressive names
-  Fixed weird two-column layout issue
-  Styled OrderMadeCard

# Friday & Saturday

-  Break. Applied for jobs

# Sunday 24 March

-  Added SplashScreen and ContentSplash
-  Style fixes
-  Worked on database operation

# Monday 24 March

Lots of work on code quality

-  Working on a `checkAccess` function. This reduces a lot of repetition but I need to think really carefully about it before implementing it on every route
-  created `mapOrders`. This is probably the most complex piece of the application so it's great to have this completed
-  created `getOrdersData`. This is another extremely useful function
-  I currently feel like the entire codebase is a mess, however I'm right at the start of getting it properly cleaned up
-  All the stuff I'm thinking so carefully about with my API is very difficult, and I feel like most developers just cop out - logging errors to the console, rendering technical messages on the page, lots of really bad practices.

# Tuesday 25 March

-  Organised CSS
-  Created email templates barrel
-  Worked on /user-flows page that serves as a visual global to-do list
-  Filled out user flows data. Everything seems much more manageable now!
-  Also started using Jira, which seems cool

# Wednesday 26 March

-  Last night I started reading a book called `Testing JavaScript Applications` and it has blown my mind! I need to start writing lots of unit tests. My end-to-end tests before were ambitious, but they couldn't be as reliable as unit tests.
-  When I woke up this morning my my was much clearer about my new route logging system too. I think I've come up with something quite elegant, and this will work great with my tests.
-  Learned the joy of JSDoc comments. I have seen these all over before and had no idea I could write them myself!
-  Refactored `/api/create-account`
-  Installed Vitest
-  Wrote first route test file
-  Will probably need to use Zod as my requirements are quite specific

# Thursday 27 March

-  Filled out User Flows data
-  Refactored /api/authentication/sign-out
-  Added a sign out success notification
-  Moved UserMessages to new file
-  Added subscribe button to /settings
-  Worked on UX for subscriptions
-  Used search params to display a notification, then wipe the params and remove the item from history
-  Refactored /api/payments/create-checkout-session
-  Refactored SubscribeButton - UX is really good now!

# Friday 28 March

-  Refactored /api/orders GET and POST
-  Updated order creation page

# Saturday 29 March - Friday 4 April

-  Had a big break while I worked on a site for a law firm using headless WordPress and Payload CMS

# Saturday 5 April

-  Figured out how to test cookies on API routes use node-fetch! Big breakthrough!

# Sunday 6 April

-  Implemented Zod on create-account route
-  Big progress with testing!

# Monday 7 April

-  Wrote lots of unit tests, including free trial date and mapOrders

# Tuesday 8 - Thursday 10 April

-  Mainly been working on Archer Finch Legal, which is nearly finished
-  Wrote first React tests, which is very satisfying. 108 tests so far, all passing!

# Sunday 20 April

Completely forgot about journaling, but I've been working hard

-  Have been writing tons of API tests, which is super helpful. Looking forward to refactoring with Zod once I'm done

# Monday 21 April

A bit of a breakthrough today. Have made some really useful utilities like apiRequest (that I can use in every project) that massively reduce repetition. Also made created createApiUrl, that uses urlJoin to create the path without missing/duplicated slashes, and accepts a segment and search parameters using the built in node:URL. I also wrote tests for it and I'm very pleased. I wrote details of a sprint for the week which are focussing on API testing, and I've printed it out and put it in a frame. I've checked off a lot of it already and it's all feeling really positive. Around 120 tests passing so far, which is very satisfying!

-  Evening - 179 tests passing!
