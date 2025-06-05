import { CTAs } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import type { DualPriority } from '@/types'
import Link from 'next/link'

type Props = {
	primaryStyles?: string
	secondaryStyles?: string
	dualStyles?: string
	startWith?: DualPriority
	onClick?: () => void
}

export default function CtaPair({
	primaryStyles = 'button-primary',
	secondaryStyles = 'button-secondary',
	startWith = 'secondary',
	dualStyles,
	onClick,
}: Props) {
	const links = [
		<Link
			key={CTAs.primary.href}
			href={CTAs.primary.href}
			className={mergeClasses('button-primary', dualStyles, primaryStyles)}
			onClick={onClick}
		>
			{CTAs.primary.displayText}
		</Link>,
		<Link
			key={CTAs.secondary.href}
			href={CTAs.secondary.href}
			className={mergeClasses('button-secondary', dualStyles, secondaryStyles)}
			onClick={onClick}
		>
			{CTAs.secondary.displayText}
		</Link>,
	]

	return <>{startWith === 'primary' ? links : links.reverse()}</>
}
