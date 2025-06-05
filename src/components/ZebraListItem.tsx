import { isDevelopment } from '@/library/environment/publicVariables'
import { mergeClasses } from '@/library/utilities/public'
import type { ReactNode } from 'react'

interface Props {
	index: number
	oddStyles?: string
	evenStyles?: string
	baseStyles?: string
	dataComponent?: string
	children: ReactNode
}

export default function ZebraListItem({
	index,
	dataComponent,
	oddStyles = 'bg-blue-50 border-blue-100',
	evenStyles = 'bg-zinc-50 border-zinc-100',
	baseStyles = 'flex flex-col gap-y-6 w-full p-4 border-2 rounded-xl',
	children,
}: Props) {
	return (
		<li data-component={isDevelopment && dataComponent} className={mergeClasses(baseStyles, index % 2 ? oddStyles : evenStyles)}>
			{children}
		</li>
	)
}
