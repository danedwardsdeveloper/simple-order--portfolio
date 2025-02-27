import { useUser } from '@/providers/user'

export default function UserInformation() {
	const { user } = useUser()

	if (!user) return null

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
