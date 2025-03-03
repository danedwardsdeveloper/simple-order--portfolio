import { useUi } from '@/providers/ui'
import { useUser } from '@/providers/user'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

export default function BreadCrumbsTest() {
	const { user } = useUser()
	const { breadCrumbTest } = useUi()

	if (!user) return null

	return (
		<nav>
			<ul className="flex gap-x-4 items-center mt-2 mb-8">
				<li>{user.businessName}</li>
				<ChevronRightIcon className="size-5 text-zinc-500" />
				<li className="font-medium text-blue-600">{breadCrumbTest}</li>
			</ul>
		</nav>
	)
}
