import { websiteCopy } from '@/library/constants'
import { mergeClasses } from '@/library/utilities/public'
import CtaPair from './CtaPair'

export default function CtaSection({ marginClasses }: { marginClasses: string }) {
	const { title, intro } = websiteCopy.ctaSection

	return (
		<div className={mergeClasses('px-6 sm:px-6 lg:px-8', marginClasses)}>
			<div className="mx-auto max-w-2xl sm:text-center">
				<p className="mt-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-balance">{title}</p>
				<p className="mt-6 text-lg font-medium text-zinc-600 leading-8">{intro}</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<CtaPair dualStyles="text-2xl" />
				</div>
			</div>
		</div>
	)
}
