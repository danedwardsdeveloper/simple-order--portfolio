import { mergeClasses } from '@/library/utilities/public'
import { BellIcon, CpuChipIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Square, SquareCheckBig } from 'lucide-react'
import type { FlowStep } from '../data'

export default function Step({ step, isLast }: { step: FlowStep; isLast: boolean }) {
	return (
		<div
			className={mergeClasses(
				'relative rounded-xl py-6 px-2 border-2',
				step.completed ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100',
			)}
		>
			{/* Connector line */}
			{!isLast && <div className="absolute left-7 -bottom-8 w-0.5 h-8 bg-zinc-300 -z-10" />}

			<div className="flex">
				<div
					className={mergeClasses(
						'bg-white rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-sm flex-shrink-0',
						step.completed ? 'text-blue-600' : 'text-orange-600',
					)}
				>
					{(() => {
						const icons = {
							user: UserCircleIcon,
							system: CpuChipIcon,
							email: EnvelopeIcon,
							notification: BellIcon,
						}

						const IconComponent = icons[step.type]
						return <IconComponent className="size-5" />
					})()}
				</div>

				<div className="flex-grow">
					<div className="font-medium mb-2">{step.title}</div>

					{step.subSteps && step.subSteps.length > 0 && (
						<div className="mt-3 flex flex-col gap-y-4">
							{step.subSteps.map((subStep) => (
								<div key={subStep} className="flex gap-x-2 mb-2 text-gray-700">
									<div className={mergeClasses('size-1.5 rounded-full shrink-0 mt-2', step.completed ? 'bg-blue-300' : 'bg-orange-300')} />
									<p>{subStep}</p>
								</div>
							))}
						</div>
					)}

					<div className="mt-4 pt-4 border-t border-gray-200">
						<div className={mergeClasses('flex items-center gap-x-2 mb-2', step.completed ? 'text-zinc-600' : 'text-orange-600/80')}>
							{step.completed ? <SquareCheckBig className="size-5 " /> : <Square className="size-5 " />}
							<span>{step.completed ? 'Completed' : 'ToDo'}</span>
						</div>
						{step.notes && <p className="text-zinc-600 w-full p-2 rounded-md">{step.notes}</p>}
					</div>
				</div>
			</div>
		</div>
	)
}
