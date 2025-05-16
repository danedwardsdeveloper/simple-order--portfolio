import { friday, monday, thursday, tuesday, wednesday } from './dateTime'

export const defaultCutOffTime = new Date(Date.UTC(1970, 0, 1, 23, 59, 0))
export const defaultLeadTimeDays = 1

export const defaultAcceptedDeliveryDayIndices = [monday, tuesday, wednesday, thursday, friday]

export const temporaryVat = 20
