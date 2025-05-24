'use client'
import { mergeClasses } from '@/library/utilities/public'
import { Field, Label, Switch } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useUi } from './providers/ui'

export default function DemoBadge() {
	const { demoMode, setDemoMode, merchantMode, setMerchantMode, toggleMerchantMode } = useUi()
	const router = useRouter()

	if (!demoMode) return null

	function handleDismiss() {
		setDemoMode(false)
		router.push('/')
	}

	return (
		<div className="fixed bottom-4 left-0 right-0 mx-auto w-fit md:w-auto md:left-auto md:right-4 bg-orange-600 text-white rounded-full shadow-lg overflow-hidden">
			<div className="flex items-center">
				<button type="button" className="px-4 py-2 font-medium">
					Demo
				</button>

				<Field className="flex items-center">
					<Label as="span" className="mr-3">
						<button
							type="button"
							onClick={() => setMerchantMode(true)}
							disabled={merchantMode}
							className={mergeClasses(
								'transition-all duration-300 mr-1',
								merchantMode ? 'text-white cursor-default' : 'text-zinc-300 hover:text-zinc-200 active:text-zinc-100',
							)}
						>
							as merchant
						</button>
					</Label>
					<Switch
						checked={!merchantMode}
						onChange={toggleMerchantMode}
						className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-100 focus:ring-offset-2 bg-orange-100"
					>
						<span
							aria-hidden="true"
							className="pointer-events-none inline-block size-5 transform rounded-full bg-orange-400 shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
						/>
					</Switch>
					<Label as="span" className="ml-3 ">
						<button
							type="button"
							onClick={() => setMerchantMode(false)}
							disabled={!merchantMode}
							className={mergeClasses(
								'transition-all duration-300 mr-1',
								!merchantMode ? 'text-white cursor-default' : 'cursor-pointer text-zinc-300  hover:text-zinc-200 active:text-zinc-100',
							)}
						>
							as customer
						</button>
					</Label>
				</Field>

				<button
					type="button"
					title="Exit demo mode and return to home page"
					onClick={handleDismiss}
					className="p-2 hover:bg-orange-300 transition-colors duration-300"
				>
					<XCircleIcon className="size-6 text-zinc-200 hover:text-red-600" />
				</button>
			</div>
		</div>
	)
}
