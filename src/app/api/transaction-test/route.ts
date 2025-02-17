import { httpStatus } from '@/library/constants/httpStatus';
import { database } from '@/library/database/connection';
import { testEmailInbox } from '@/library/database/schema';
import logger from '@/library/logger';
import type { TestEmail, TestEmailInsertValues } from '@/types';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

interface TransactionTestGETresponse {
	message: string;
}

export async function GET(): Promise<NextResponse<TransactionTestGETresponse>> {
	let transactionErrorMessage = null;
	let transactionErrorStatus = null;

	try {
		await database.transaction(async (tx) => {
			const newEmailInsertValues: TestEmailInsertValues = {
				content:
					'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
			};

			transactionErrorMessage = 'error inserting new row';
			transactionErrorStatus = httpStatus.http409conflict;
			tx.insert(testEmailInbox).values(newEmailInsertValues).returning();

			const [existingEmail]: TestEmail[] = await tx
				.select()
				.from(testEmailInbox)
				.where(
					and(
						eq(testEmailInbox.id, 1),
						eq(testEmailInbox.content, 'Non-existent content!')
					)
				);

			if (!existingEmail) {
				transactionErrorMessage = 'error finding existing row';
				transactionErrorStatus = httpStatus.http404notFound;
				logger.error(`Couldn't find existing email in test_email_inbox`);
				tx.rollback();
			} else {
				logger.info('Existing email: ', existingEmail);
				transactionErrorMessage = null;
				transactionErrorStatus = null;
			}
		});

		return NextResponse.json(
			{ message: 'success' },
			{ status: httpStatus.http200ok }
		);
	} catch (error) {
		logger.error('api/transaction-test error: ', error);
		return NextResponse.json(
			{ message: transactionErrorMessage || 'server error' },
			{ status: transactionErrorStatus || httpStatus.http500serverError }
		);
	}
}
