import type { FormattedProduct } from '@/types'

export function LineItems({ formattedProducts }: { formattedProducts: FormattedProduct[] }) {
	return (
		<ul className="flex flex-col gap-y-6 divide-y-2 divide-zinc-200 mb-8">
			{formattedProducts?.map((item) => (
				<li key={item.id} className="flex flex-col pt-2 first:pt-4 pb-8">
					{/* Heading */}
					<div className="flex justify-between mb-3">
						<span className="text-xl">{item.name}</span>
						<div>
							<span className="text-zinc-600">x </span>
							<span className="text-xl">{item.quantity}</span>
						</div>
					</div>

					{/* Body */}
					<div className="flex justify-between text-zinc-700">
						<span>{item.itemPrice} each</span>
						<span>Item subtotal {item.subtotalWithVat}</span>
					</div>
				</li>
			))}
		</ul>
	)
}
