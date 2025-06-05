import { mergeClasses } from '@/library/utilities/public'
import type { MouseEvent, ReactNode } from 'react'
import Spinner from './Spinner'

type BaseButtonProps = {
	type: HTMLButtonElement['type']
	isDisabled: boolean
	isLoading: boolean
	classes?: string
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
	dataTestId?: string
	children: ReactNode
	formId?: string
}

function BaseButton({ type = 'button', isDisabled, isLoading, onClick, dataTestId, children, classes, formId }: BaseButtonProps) {
	return (
		<button
			type={type}
			form={formId}
			disabled={isDisabled}
			data-test-id={dataTestId}
			onClick={onClick}
			className={mergeClasses(
				'w-full rounded-lg px-3 py-1 font-medium transition-all duration-300 outline-offset-4 focus-visible:outline-orange-400 border-2',
				isDisabled
					? 'text-zinc-400 bg-zinc-200 border-zinc-300 cursor-not-allowed'
					: isLoading
						? 'bg-blue-600 border-blue-600 text-white cursor-not-allowed'
						: 'bg-blue-600 border-blue-600 hover:bg-blue-500 hover:border-blue-500 active:border-blue-400 active:bg-blue-400 text-white cursor-pointer',
				classes,
			)}
		>
			{children}
		</button>
	)
}

type SubmitButtonProps = {
	formReady: boolean
	isSubmitting: boolean
	content: string | ReactNode
	dataTestId?: string
	classes?: string
	formId?: string
}

export function SubmitButton({ formReady, isSubmitting, content, dataTestId, classes, formId }: SubmitButtonProps) {
	return (
		<BaseButton type="submit" formId={formId} isDisabled={!formReady || isSubmitting} isLoading={isSubmitting} dataTestId={dataTestId}>
			<div className={mergeClasses('min-h-7 flex justify-center', classes)}>{isSubmitting ? <Spinner colour="text-white" /> : content}</div>
		</BaseButton>
	)
}

type ActionButtonProps = Pick<BaseButtonProps, 'onClick' | 'dataTestId' | 'classes'> & {
	content: ReactNode
	isDisabled: boolean
	isLoading: boolean
}

export function ActionButton({ isDisabled, isLoading, onClick, content, dataTestId, classes }: ActionButtonProps) {
	return (
		<BaseButton
			type="button"
			isDisabled={isDisabled || isLoading}
			isLoading={isLoading}
			dataTestId={dataTestId}
			onClick={onClick}
			classes={classes}
		>
			<div className="min-h-7 flex justify-center gap-x-2">{isLoading ? <Spinner colour="text-white" /> : content}</div>
		</BaseButton>
	)
}
