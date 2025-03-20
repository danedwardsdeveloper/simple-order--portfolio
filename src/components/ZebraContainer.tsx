import { mergeClasses } from '@/library/utilities/public'
import type { ReactNode } from 'react'

interface Props {
	index: number
	oddStyles: string
	evenStyles: string
	baseStyles: string
	children: ReactNode
}

export default function ZebraContainer({ index, oddStyles, evenStyles, baseStyles, children }: Props) {
	return <div className={mergeClasses(baseStyles, index % 2 ? oddStyles : evenStyles)}>{children}</div>
}
