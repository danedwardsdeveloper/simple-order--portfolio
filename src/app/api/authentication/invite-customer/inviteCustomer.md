# Situations

1. Recipient is already a confirmed customer of this merchant

   - present in `users` and `customerToMerchant`
   - no need to send email

2. Recipient has pending relationship (but hasn't accepted yet)

   - Entry exists in customer_to_merchant but not accepted
   - No need to send email

3. No previous invitation or relationship

   - Create new invitation and send email
