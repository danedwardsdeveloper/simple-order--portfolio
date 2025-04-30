# Test Case Descriptions

## Authentication & Authorization

-  No cookie
-  Valid cookie, no body
-  Invalid cookie
-  Expired cookie
-  Expired token
-  User not found

## Permission Tests

-  Email not confirmed, no trial, no subscription
-  Email not confirmed, yes trial
-  Email not confirmed, yes subscription
-  Email confirmed, no trial, no subscription
-  Email confirmed, yes subscription
-  Email confirmed, yes trial
-  Valid cookie, valid body, email confirmed, no trial or subscription
-  Valid cookie, valid body, email confirmed, in-date trial

## Product Validation

-  Empty body
-  Invalid body
-  Missing name
-  Missing price field
-  Duplicate product name
-  Name contains illegal characters
-  Description contains illegal characters
-  Description too long
-  Price not a number
-  Price too high
-  Zero or negative price value
-  Custom VAT not a number
-  Custom VAT too high
-  Custom VAT is a decimal
-  Custom VAT is negative
-  Empty string for name after trimming

## Limits & Edge Cases

-  Rejects the 101th product
-  Reject a duplicate product
-  Rejects when there are too many products

## Success Cases

-  Success case
