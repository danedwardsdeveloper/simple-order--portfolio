import type { UiContextType } from '@/types/definitions/contexts/ui'
import { Transition } from '@headlessui/react'

type Props = Pick<UiContextType, 'mobileMenuOpen' | 'setMobileMenuOpen'>

export default function BlurredBackdrop(props: Props) {
	return (
		<Transition
			show={props.mobileMenuOpen}
			appear={true}
			enter="transition-opacity duration-300 ease-in-out"
			enterFrom="opacity-0"
			enterTo="opacity-50"
			leave="transition-opacity duration-300 ease-in-out"
			leaveFrom="opacity-50"
			leaveTo="opacity-0"
		>
			<button
				data-component="mobile-panel-blurred-backdrop"
				type="button"
				onClick={() => props.setMobileMenuOpen(false)}
				className="fixed md:hidden inset-0 h-screen w-screen backdrop-blur bg-white/50 blur z-mobile-blurred-backdrop"
			/>
		</Transition>
	)
}
