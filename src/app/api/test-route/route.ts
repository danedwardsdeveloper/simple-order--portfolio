import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/library/database/configuration'
import { DrizzleTest, drizzleTest, NewDrizzleTest } from '@/library/database/schema'
import logger from '@/library/logger'

import { HttpStatus } from '@/types'

export type BasicMessages = 'success' | 'server error'

export interface TestRouteGETresponse {
  message: BasicMessages
  users?: DrizzleTest[]
}

export async function GET(request: NextRequest): Promise<NextResponse<TestRouteGETresponse>> {
  try {
    const allUsers = await db.select().from(drizzleTest)
    return NextResponse.json(
      {
        message: 'success',
        users: allUsers,
      },
      {
        status: HttpStatus.http200ok,
      },
    )
  } catch (error) {
    logger.error('Error getting test info: ', error)
    return NextResponse.json({ message: 'server error' }, { status: HttpStatus.http500serverError })
  }
}

export type TestRoutePOSTbody = Omit<NewDrizzleTest, 'id'>

export interface TestRoutePOSTresponse {
  message: BasicMessages
}

export async function POST(request: NextRequest): Promise<NextResponse<TestRoutePOSTresponse>> {
  try {
    const body = (await request.json()) as TestRoutePOSTbody

    await db.insert(drizzleTest).values(body)

    return NextResponse.json({ message: 'success' }, { status: HttpStatus.http200ok })
  } catch (error) {
    logger.error('Error creating test entry: ', error)
    return NextResponse.json({ message: 'server error' }, { status: HttpStatus.http500serverError })
  }
}
