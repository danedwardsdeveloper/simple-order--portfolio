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

## Thursday 27 February 2025

-  Retrieved the merchant name from `api/inventory/merchants/[merchantSlug]` instead of a dedicated route for convenience
-  Fixed controlled component type issue with AddInventoryForm
-  Finally displayed the customer's view of a merchant's products on their slug page!
-  Added breadcrumbs to the customer's view of the merchant's products
-  Made Breadcrumbs component reusable (articles, merchants etc.)
-  Updated the default user state to use empty arrays instead of null
-  Worked on /dashboard page, getting it to fetch initial data
