import Link from 'next/link'

export default function UnauthorisedLinks() {
	return (
		<div className="flex flex-col gap-y-4">
			<p className="text-red-600">You must be signed in to view this page.</p>
			<div className="flex gap-x-4">
				<Link href="/sign-in" className="button-secondary">
					Sign in
				</Link>
				<Link href="/free-trial" className="button-secondary">
					Create an account
				</Link>
			</div>
		</div>
	)
}
