'use client'
import { useLoading } from '@/providers/loading'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import CompanyLogo from './Icons'
import Spinner from './Spinner'

export default function SplashScreen() {
	const [splashExists, setSplashExists] = useState(true)
	const { siteLoading } = useLoading()

	const forceShow = false

	const showSplash = forceShow || siteLoading

	useEffect(() => {
		if (showSplash) {
			document.body.style.overflow = 'hidden'
			setSplashExists(true)
		} else {
			document.body.style.overflow = ''
			const timer = setTimeout(() => {
				setSplashExists(false)
			}, 550)
			return () => clearTimeout(timer)
		}
	}, [showSplash])

	if (!splashExists) return null

	return (
		<div
			data-component="SplashScreen"
			className={clsx(
				'fixed inset-0 flex flex-col h-full z-splash-screen items-center justify-center bg-slate-50 transition-opacity duration-500',
				showSplash ? 'opacity-100' : 'pointer-events-none opacity-0',
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
