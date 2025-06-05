import type { FormattedDate, FormattedOrder } from '@/types'

function DateItem({ label, formattedDate }: { label: string; formattedDate: FormattedDate | undefined }) {
	if (!formattedDate || !formattedDate.raw) return null

	return (
		<div className="mb-2 text-right">
			<span className="block text-zinc-600">{label}</span>
			<time
				className="block" //
				dateTime={formattedDate.raw.toISOString()}
			>
				<span className="font-medium">{formattedDate.formatted}</span>

				{formattedDate.relativeLabel && <span className=" text-zinc-600"> {formattedDate.relativeLabel}</span>}
			</time>
		</div>
	)
}

type Props = Pick<FormattedOrder, 'createdAt' | 'requestedDeliveryDate' | 'updatedAt'>

export function DeliveryDateInfo({ requestedDeliveryDate, createdAt, updatedAt }: Props) {
	const orderHasBeenUpdated = updatedAt?.formatted !== createdAt.formatted

	return (
		<div className="mb-8 flex flex-col gap-y-4">
			<DateItem
				label="Requested delivery date" //
				formattedDate={requestedDeliveryDate}
			/>
			<DateItem
				label="Order placed" //
				formattedDate={createdAt}
			/>
			{orderHasBeenUpdated && (
				<DateItem
					label="Updated" //
					formattedDate={updatedAt}
				/>
			)}
		</div>
	)
}
