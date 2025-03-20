import { mergeClasses } from '@/library/utilities/public'
import type { ReactNode } from 'react'

interface Props {
	mainColumn: ReactNode
	mainColumnClasses?: string
	sideColumn: ReactNode
	sideColumnClasses?: string
}

export default function TwoColumnContainer({ mainColumn, mainColumnClasses, sideColumn, sideColumnClasses }: Props) {
	return (
		<div data-component="TwoColumnContainer" className="mx-auto w-full grow flex flex-col lg:flex-row gap-8">
			{/* Main column */}
			<div className={mergeClasses('flex-1 xl:flex order-last lg:order-first flex flex-col', mainColumnClasses)}>{mainColumn}</div>

			{/* Aside column */}
			<div className="shrink-0 lg:w-96 order-first lg:order-last">
				<div className={mergeClasses('flex flex-col', sideColumnClasses)}>{sideColumn}</div>
			</div>
		</div>
	)
}
