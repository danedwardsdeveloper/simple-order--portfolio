import type { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
	return (
		<div data-component="PageContainer" className="max-w-4xl w-full mx-auto mt-menubar-offset px-4 lg:px-0 pt-4">
			{children}
		</div>
	)
}
