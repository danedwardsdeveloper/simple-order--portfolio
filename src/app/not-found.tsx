import { CtaPair } from '@/components/heroSection'
import type { Metadata } from 'next'
import { HomePageContent } from './page'

export const metadata: Metadata = {
	title: 'Page not found',
}

function NotFoundComponent() {
	return (
		<main className="grid min-h-full place-items-center bg-white px-6 pt-12 lg:px-8 mt-menubar-offset">
			<div className="text-center">
				<p className="text-base font-semibold text-blue-600">404</p>
				<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Page not found</h1>
				<p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<CtaPair />
				</div>
			</div>
		</main>
	)
}

export default function NotFoundPage() {
	return (
		<>
			<NotFoundComponent />
			<HomePageContent />
		</>
	)
}
