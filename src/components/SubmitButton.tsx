import { mergeClasses } from '@/library/utilities/public'
import type { ReactNode } from 'react'
import Spinner from './Spinner'

type Props = {
	formReady: boolean
	isSubmitting: boolean
	content: string | ReactNode
	dataTestId?: string
	classes?: string
	innerClasses?: string
}

export default function SubmitButton({ formReady, isSubmitting, content, dataTestId, classes, innerClasses }: Props) {
	return (
		<button
			type="submit"
			data-test-id={dataTestId}
			disabled={isSubmitting || !formReady}
			className={mergeClasses(
				'w-full rounded-lg px-3 py-1 font-medium transition-all duration-300 outline-offset-4 focus-visible:outline-orange-400 mt-4 border-2',
				!formReady
					? 'text-zinc-400 bg-zinc-200 border-zinc-300 cursor-not-allowed'
					: isSubmitting
						? 'bg-blue-600 border-blue-600 text-white cursor-not-allowed'
						: 'bg-blue-600 border-blue-600 hover:bg-blue-500 hover:border-blue-500 active:border-blue-400 active:bg-blue-400 text-white',
				classes,
			)}
		>
			<div className={mergeClasses('min-h-7 flex justify-center', innerClasses)}>
				{/*  */}
				{isSubmitting ? <Spinner colour="text-white" /> : content}
			</div>
		</button>
	)
}
