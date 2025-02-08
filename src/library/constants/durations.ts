export const durationOptions = {
  oneYearInSeconds: 365 * 24 * 60 * 60,
  twentyFourHoursInMilliseconds: 24 * 60 * 60 * 1000,
  oneWeekInMilliseconds: 7 * 24 * 60 * 60 * 1000,
} as const

export const durationSettings = {
  staySignedInCookie: durationOptions.oneYearInSeconds,
  confirmEmailExpiry: durationOptions.twentyFourHoursInMilliseconds,
  confirmInvitationExpiry: durationOptions.oneWeekInMilliseconds,
} as const

/*
// Increasing email resend intervals
- Send a maximum of 5 emails
  - Send first instantly
  - Second after 15 minutes
  - third after another 15 minutes
  - fourth after another hour
  - final after another 24 hours
*/
