import Link from 'next/link'
import CompanyLogo from '../Icons'

type Props = {
	onClick?: () => void // Close mobile menu
	alreadyOnHomePage: boolean
}

export default function HomePageLink(props: Props) {
	if (props.alreadyOnHomePage) {
		return (
			<div className="flex gap-x-1 items-center h-full  transition-colors duration-300 text-blue-600 cursor-default">
				<CompanyLogo size="size-6" />
				<span className="font-medium text-xl">Simple Order</span>
			</div>
		)
	}

	return (
		<Link
			// ToDo: link to appropriate currency page!
			href="/"
			onClick={props.onClick}
			className="flex gap-x-1 items-center h-full  transition-colors duration-300 text-zinc-600 hover:text-blue-600 active:text-blue-500"
		>
			<CompanyLogo size="size-6" />
			<span className="font-medium text-xl">Simple Order</span>
		</Link>
	)
}
