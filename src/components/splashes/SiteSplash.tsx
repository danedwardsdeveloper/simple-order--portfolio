'use client'
import { useLoading } from '@/components/providers/loading'
import { clsx } from 'clsx'
import CompanyLogo from '../Icons'
import Spinner from '../Spinner'

export function SiteSplash() {
	const { siteSplashExists, showSiteSplash } = useLoading()

	if (!siteSplashExists) return null

	return (
		<div
			data-component="SiteSplash"
			className={clsx(
				'fixed inset-0 flex flex-col h-full z-splash-screen items-center justify-center bg-slate-50 transition-opacity duration-500',
				showSiteSplash ? 'opacity-100' : 'pointer-events-none opacity-0',
			)}
		>
			<Spinner />
			<div className="absolute bottom-10 md:bottom-20 flex flex-col items-center gap-y-4">
				<CompanyLogo colour="text-blue-600" size="size-20" />
				<h1 className="mb-0">Simple Order</h1>
			</div>
		</div>
	)
}
