import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

type Props = {
	showPassword: boolean
	onClick: () => void
}

export default function PasswordVisibilityButton(props: Props) {
	const Icon = props.showPassword ? EyeIcon : EyeSlashIcon

	return (
		<>
			<button
				type="button"
				aria-label="Toggle password visibility"
				onClick={props.onClick}
				className="absolute right-3 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-orange-400 focus-visible:outline-2 focus-visible:rounded hover:bg-zinc-200 active:bg-zinc-300 rounded transition-colors duration-300 p-1"
				tabIndex={0}
			>
				<Icon className="text-zinc-600 hover:text-blue-600 active:text-blue-700 size-6" />
			</button>
			<div aria-live="polite" id="password-text" className="sr-only">
				{props.showPassword ? 'Password visible' : 'Password hidden'}
			</div>
		</>
	)
}
