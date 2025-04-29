import type { HttpStatus } from '@/types'

export const http200ok: HttpStatus = 200
export const http201created: HttpStatus = 201
export const http202accepted: HttpStatus = 202
export const http204noContent: HttpStatus = 204
export const http206partialContent: HttpStatus = 206

export const http400badRequest: HttpStatus = 400
export const http401unauthorised: HttpStatus = 401
export const http403forbidden: HttpStatus = 403
export const http404notFound: HttpStatus = 404
export const http405methodNotAllowed: HttpStatus = 405
export const http409conflict: HttpStatus = 409
export const http410gone: HttpStatus = 410
export const http415unsupportedMediaType: HttpStatus = 415
export const http422unprocessableContent: HttpStatus = 422
export const http429tooManyRequests: HttpStatus = 429

export const http500serverError: HttpStatus = 500
export const http501notImplemented: HttpStatus = 501
export const http502badGateway: HttpStatus = 502
export const http503serviceUnavailable: HttpStatus = 503
export const http504gatewayTimeout: HttpStatus = 504
