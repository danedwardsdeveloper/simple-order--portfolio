'use client'
import { useLoading } from '@/components/providers/loading'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import Spinner from '../Spinner'

export function ContentSplash({ siteContent }: { siteContent: ReactNode }) {
	const { contentSplashExists, showContentSplash } = useLoading()

	if (!contentSplashExists) return siteContent

	return (
		<div
			data-component="ContentSplash"
			className={clsx(
				'flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center transition-opacity duration-500',
				showContentSplash ? 'opacity-100' : 'pointer-events-none opacity-0',
			)}
		>
			<Spinner />
		</div>
	)
}
