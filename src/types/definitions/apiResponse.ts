export type ApiResponse<Success extends { ok: true }, Failure extends { ok: false }> =
	| (Success & { [k in Exclude<keyof Failure, keyof Success | 'ok'>]?: never })
	| (Failure & { [k in Exclude<keyof Success, keyof Failure | 'ok'>]?: never })
