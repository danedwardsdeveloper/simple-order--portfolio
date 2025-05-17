import { mergeClasses } from '@/library/utilities/public'
import type { ReactNode } from 'react'

interface Props {
	mainColumn: ReactNode
	mainColumnClasses?: string
	sideColumn: ReactNode
}

export default function TwoColumnContainer({ mainColumn, mainColumnClasses, sideColumn }: Props) {
	return (
		<div data-component="TwoColumnContainer" className="w-full max-w-full grow flex flex-col lg:flex-row gap-8">
			{/* Main column */}
			<div className={mergeClasses('flex-1 xl:flex order-last lg:order-first flex flex-col min-w-0 w-full', mainColumnClasses)}>
				{mainColumn}
			</div>

			{/* Aside column */}
			<div className="shrink-0 lg:w-96 order-first lg:order-last min-w-0 w-full">
				<div className="flex flex-col gap-y-4">{sideColumn}</div>
			</div>
		</div>
	)
}
