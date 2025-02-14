# Simple Order - an order management website for wholesalers and their customers

## Business plan

### Overview

Initially, I'm targeting small bakeries in the UK that currently take orders over the phone.

The website is simpleorder.co.uk but it's not live yet.

Just a simple, slick website where regular customers can place orders, and the wholesaler can see them all. I'm charging £19.50 per month, which is much cheaper than other more complicated options.

All prices are in GBP and all times are GMT/BST.

To use the site, you either have to sign up as a merchant, or be invited to be a customer of an existing merchant. All emails must be confirmed.

I think it's worth this because it frees up a lot of time for the person who would otherwise have to answer the phone.

### Referrals

I'm offering merchants a free trial for 30 days without any card details. Then they have to subscribe to continue using the site.

There will be a referral system so that merchants can get additional free months but I haven't worked out the details yet

### USPs

- Deliberate lack of features. It's not accounting software, and it doesn't handle payments (most wholesalers use direct debits, which are much cheaper than online payments)
- Beautiful and calm user interface with lots of whitespace and no adverts
- You can be both a customer and a merchant with the same email - you press a button to toggle between the two.This is essential because ideally my business will be extremely popular, and a bakery could be using the site to sell pastries to cafes, and also order their butter and flour from other merchants using the site.
- Friction-free trial. You can start using the site without entering card details - most competitors require a phone call to get started
- Low price. I'm charging a reasonable price - most competitors are around £80-150 per month. But even at my much lower price, it's still very profitable as my only expenses will be site and database hosting costs, plus my time offering support
- My mum owns a village shop, so I have a lot of insider knowledge about how wholesalers work

# Tech

- Next.js 15 App router, written in TypeScript, deployed with Fly.io
- Postgres with Drizzle query builder deployed with Neon free tie
- Mailgun for transactional emails
- Tailwind, CLSX, Heroicons,
- VS Code, PNPM, Eslint, Prettier, Cspell, GitHub, MacBook Pro

## Ui

Theme colours are tailwind blue-600 & white
Text is zinc-800, 700 & 600
I have access to the Tailwind UI library
I like using Heroicons
The company logo is a ticked checkbox in blue-600 against a white background

## Database tables

```yaml
users
merchant_profiles
relationships
trials
subscriptions
products
orders
order_items
analytics # This isn't worked out yet...
```

## Development plan

# North Star

➔ Launch minimum viable product
➔ Get first paying customer
➔ Iterate from feedback

### Phase 1 - Basic prototype

(All simulated with hard-coded data)

1. Authentication
2. Inventory management
3. Customer invitation
4. Customer order creation and submission
5. Default order
6. Standing order
7. VAT settings
8. Merchant holiday settings
9. Merchant order aggregation for printing & export

### Phase 3 - Launch

Set everything up so people can actually use the site

1. Database integration
2. Stripe integration
3. Mailgun integration
4. Very basic built-in analytics (page views, countries) but no data display
5. Redirect from Fly to custom domain (launch)

### Phase 3 - Attract customers & grow

1. Referral system
2. SEO blog articles
3. A/B testing on CTA button
4. Captchas
5. Product photos
6. Minimum/maximum quantity settings
7. Analytics panel (only accessible to with my email address )
8. Currency & timezone settings.
9. Optional customisable public storefront page
10. Usage limits/maximum number of products/orders

## Never features

- order confirmation emails. Email is unreliable, and these are not necessary. Once the oder is in the database, the ui can state that the order is confirmed. There is also an existing relationship between merchants and customers, so abuse is unlikely. If there was a problem with an order, the merchant would have to phone the customer, and then adjust their settings to avoid it happening again.
- Multiple emails per account/permissions - I'm targeting small businesses.
- I'm not collecting a mailing list for soft leads. People are either interested in the free trial or not
- monthly/yearly pricing
- Stock quantities or limits
- Product categories

## Project structure

### Source code organisation

```txt
/src
    /app
    /components
        Providers.ts
    /providers
        ui.ts
    /library
        /database
            configuration.ts
        /environment
            serverVariables.ts
            publicVariables.ts
    /types
        index.ts
        definitions/
```

### Dynamic menu bar

For development, render 4 menu bars stacked on top of each other to show the four states.

Unauthenticated users:

```yaml
- Simple Order logo # (Home link)
- Blog
- Sign in
- Learn more # Secondary CTA, about page and demo pages
- Start trial # Primary CTA
```

Authenticated merchants only

```yaml
- Name (Business name | Customer business name | User name)
- Orders (Dynamic)
- Inventory / Merchants
- Settings
```

### Site map

```yaml
# Public pages
/ # Marketing landing page
/blog
    /seo-article-about-bakery-order-systems
/create-account
/sign-in
/privacy-policy
/terms-and-conditions

# Protected pages
/orders
/inventory
/merchants
/[merchant-slug]
/settings # Account settings live here too
```

# Constraints

- Maximum product value: £10,000
- Maximum 500 products per merchant
- Maximum orders per day...
- Maximum customers - 100

## General notes about my coding preference

- Please never use screaming snake case
- Don't import React unless you have to
- Remember to 'use client' when requiring browser interactivity
