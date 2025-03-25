import { mergeClasses } from '@/library/utilities/public'
import type { Metadata } from 'next'
import Step from './components/Step'
import { type Flow, userFlows } from './data'

export const metadata: Metadata = {
	title: 'User flows',
	alternates: {
		canonical: '/user-flows',
	},
}

export default function UserFlowPage() {
	const globalPercentage = Math.round(
		(userFlows.flatMap((flow) => flow.steps).filter((step) => step.completed).length / userFlows.flatMap((flow) => flow.steps).length) *
			100,
	)

	const flowPercentage = (flow: Flow) => Math.round((flow.steps.filter((step) => step.completed).length / flow.steps.length) * 100)

	const percentageColourClass = (percentage: number) =>
		percentage === 0 ? 'text-red-600' : percentage === 100 ? 'text-green-600' : 'text-orange-600'

	return (
		<>
			<h1 className="mb-4">
				User flows
				<span className="font-normal text-zinc-300 mx-4">|</span>
				<span className={mergeClasses('font-normal', percentageColourClass(globalPercentage))}>{globalPercentage}% complete</span>
			</h1>
			<p className="mb-12 italic text-orange-600">Development-only page</p>
			{userFlows.map((flow) => {
				const percentage = flowPercentage(flow)

				return (
					<div key={flow.title} className="mb-20">
						<h2 className="mb-6">
							{flow.title}
							<span className="font-normal text-zinc-300 mx-4">|</span>
							<span className={mergeClasses('font-normal', percentageColourClass(percentage))}>{percentage}% complete</span>
						</h2>
						<div className="flex flex-col gap-y-6">
							{flow.steps.map((step, index) => (
								<Step key={step.title} step={step} isLast={index === flow.steps.length - 1} />
							))}
						</div>
					</div>
				)
			})}
		</>
	)
}
