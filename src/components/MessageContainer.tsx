import { mergeClasses } from '@/library/utilities'
import type { ReactNode } from 'react'

type BorderClasses = 'border-emerald-300' | 'border-blue-300' | 'border-orange-300'

export default function MessageContainer({ children, borderColour }: { children: ReactNode; borderColour: BorderClasses }) {
	return <div className={mergeClasses('rounded-xl border-2 p-3 my-4 max-w-md', borderColour)}>{children}</div>
}
