# Confirm email page

- Get token from the query string
- If there is a query string, check it matches the correct format
- If it matches
  - Set loading to true
  - Update the content to loading...
  - Send a request to the api
  - On success/ already confirmed
    - Thank you
    - Further CTAs
- On fail
  - Further CTAs

## States
