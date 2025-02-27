import type { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
	return <div className="max-w-4xl w-full mx-auto mt-menubar-offset px-4 lg:px-0 pt-4 pb-60">{children}</div>
}
