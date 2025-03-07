'use client'
import { ArrowLeftIcon, DocumentIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Page() {
	const router = useRouter()
	return (
		<>
			<h1>Article not found</h1>
			<p>{`Sorry, we couldn't find the article you're looking for.`}</p>
			<div className="mt-12 flex gap-x-2 w-full">
				<button type="button" onClick={() => router.back()} className="button-secondary text-lg flex items-center gap-x-2">
					<ArrowLeftIcon className="size-6" />
					Back
				</button>
				<Link href="/" className="button-secondary text-lg flex items-center gap-x-2">
					<HomeIcon className="size-6" />
					Home
				</Link>
				<Link href="/articles" className="button-secondary text-lg flex items-center gap-x-2">
					<DocumentIcon className="size-6" />
					All articles
				</Link>
			</div>
		</>
	)
}
