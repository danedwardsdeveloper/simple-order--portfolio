import { durationOptions } from '@/library/constants'
import { initialiseDevelopmentLogger } from '@/library/utilities/public'
import { createCookieWithToken } from '@/library/utilities/server'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const TestCookieSchema = z.object({
	password: z.string().min(1, 'Password is required'),
})

export type CookieTestPOSTbody = z.infer<typeof TestCookieSchema>

export interface CookieTestPOSTresponse {
	developmentMessage?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CookieTestPOSTresponse>> {
	const developmentLogger = initialiseDevelopmentLogger('POST /api/cookie-test')

	try {
		const body = await request.json()
		const result = TestCookieSchema.safeParse(body)

		if (!result.success) {
			const developmentMessage = developmentLogger(result.error.errors[0].message)
			return NextResponse.json({ developmentMessage }, { status: 400 })
		}

		if (result.data.password === 'secretPassword69') {
			const cookieStore = await cookies()
			cookieStore.set(createCookieWithToken(1, durationOptions.oneYearInSeconds))
			return NextResponse.json({}, { status: 200 })
		}

		return NextResponse.json({}, { status: 401 })
	} catch {
		return NextResponse.json({}, { status: 500 })
	}
}
