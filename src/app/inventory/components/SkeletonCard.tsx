import { mergeClasses } from '@/library/utilities/public'

export default function SkeletonCard({ zebraStripe }: { zebraStripe: boolean }) {
	return (
		<li className={mergeClasses('flex flex-col gap-y-2 w-full p-3 rounded-xl animate-pulse', zebraStripe ? 'bg-blue-50' : 'bg-zinc-50')}>
			<div className={mergeClasses('rounded h-7 w-36', zebraStripe ? 'bg-blue-200' : 'bg-zinc-200')} />
			<div className={mergeClasses('rounded h-6', zebraStripe ? 'bg-blue-100' : 'bg-zinc-100')} />
			<div className={mergeClasses('rounded h-6', zebraStripe ? 'bg-blue-100' : 'bg-zinc-100')} />
			<div className="flex justify-between items-center">
				<div className={mergeClasses('rounded h-6 w-20', zebraStripe ? 'bg-blue-100' : 'bg-zinc-100')} />
				<div className={mergeClasses('rounded h-7 w-20', zebraStripe ? 'bg-blue-100' : 'bg-zinc-100')} />
			</div>
		</li>
	)
}
