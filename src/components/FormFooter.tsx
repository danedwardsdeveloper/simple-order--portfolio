import Link from 'next/link'

type Props = {
	text: string
	linkText: string
	href: string
}

export default function FormFooter(props: Props) {
	return (
		<div className="text-center mt-6">
			<p>
				{props.text}{' '}
				<Link href={props.href} className="link-primary">
					{props.linkText}
				</Link>
			</p>
		</div>
	)
}
