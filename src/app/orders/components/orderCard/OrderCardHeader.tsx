import type { ReactNode } from 'react'

type Props = {
	orderIdString: string
	businessName: string
	statusContent: ReactNode
}

export function OrderCardHeader(props: Props) {
	return (
		<div>
			<div className="flex justify-between">
				<span className="block text-zinc-600 mb-2">{props.orderIdString}</span>
				{props.statusContent}
			</div>
			<h3 className="text-2xl">{props.businessName}</h3>
		</div>
	)
}
