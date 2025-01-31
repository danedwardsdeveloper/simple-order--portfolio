export const durationOptions = {
  oneYearInSeconds: 365 * 24 * 60 * 60, // Cookie when stay signed in
  twentyFourHoursInMilliseconds: 24 * 60 * 60 * 1000, // Confirm email (new merchant account) expiry
  oneWeekInMilliseconds: 7 * 24 * 60 * 60 * 1000, // Confirm invitation
} as const
