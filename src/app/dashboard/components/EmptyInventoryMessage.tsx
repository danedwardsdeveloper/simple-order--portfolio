import Link from 'next/link'

export default function EmptyInventoryMessage() {
	return (
		<div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300 ">
			<Link href="/inventory" className="link-primary">
				Add your first product
			</Link>
		</div>
	)
}
