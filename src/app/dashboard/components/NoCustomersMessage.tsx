import Link from 'next/link'

export default function NoCustomersMessage({ emailConfirmed }: { emailConfirmed: boolean }) {
	if (emailConfirmed) {
		return (
			<div className="max-w-prose p-3 my-4 border-2 rounded-xl border-blue-300">
				<Link href="/customers" className="link-primary">
					Invite your first customer
				</Link>
			</div>
		)
	}

	return (
		<p className="max-w-prose p-3 my-4 border-2 rounded-xl border-orange-300">
			{'You must confirm your email before inviting your first customer'}
		</p>
	)
}
