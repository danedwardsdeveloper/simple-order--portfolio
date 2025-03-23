'use client'
import { useLoading } from '@/providers/loading'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import Spinner from './Spinner'

export default function ContentSplash() {
	const [splashExists, setSplashExists] = useState(true)
	const { siteLoading } = useLoading()

	const forceShow = false

	const showSplash = forceShow || siteLoading

	useEffect(() => {
		if (showSplash) {
			setSplashExists(true)
		} else {
			const timer = setTimeout(() => {
				setSplashExists(false)
			}, 550)
			return () => clearTimeout(timer)
		}
	}, [showSplash])

	if (!splashExists) return null

	return (
		<div
			data-component="ContentSplash"
			className={clsx(
				'flex flex-col h-[calc(100vh-3.5rem)] items-center justify-center transition-opacity duration-500',
				showSplash ? 'opacity-100' : 'pointer-events-none opacity-0',
			)}
		>
			<Spinner />
		</div>
	)
}
