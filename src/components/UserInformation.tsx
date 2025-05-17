import type { BrowserSafeCompositeUser } from '@/types'

export default function UserInformation({ user }: { user: BrowserSafeCompositeUser }) {
	return (
		<div className="flex flex-col gap-y-2 w-full max-w-md border-2 border-slate-100 rounded-xl p-3">
			<p className="font-medium">{user.businessName}</p>
			<p>
				{user.firstName} {user.lastName}
			</p>
			<p>{user.email}</p>
		</div>
	)
}
