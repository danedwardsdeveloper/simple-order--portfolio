'use client'
import { useUser } from '@/providers/user'

export default function TemporaryRoleNotice() {
	const { user } = useUser()
	if (!user) return null
	return (
		<p className="text-xl font-medium text-emerald-700">
			Role: {user.roles.charAt(0).toUpperCase()}
			{user.roles.slice(1)}
		</p>
	)
}
