import type { OrderReceived } from '@/types'

export function OrderNotes({
	adminOnlyNote,
	customerNote,
}: { adminOnlyNote: OrderReceived['adminOnlyNote']; customerNote: OrderReceived['customerNote'] }) {
	return (
		<>
			{adminOnlyNote && (
				<div>
					<h4 className="font-medium">Private note</h4>
					<p>{adminOnlyNote}</p>
				</div>
			)}

			{customerNote && (
				<div>
					<h4 className="font-medium">Customer note</h4>
					<p>{customerNote}</p>
				</div>
			)}
		</>
	)
}
