export default function SectionHeader({ title, subtitle, intro }: { title: string; subtitle?: string; intro: string }) {
	return (
		<div className="mx-auto max-w-2xl lg:text-center mb-32">
			<h2 className="text-lg/7 font-semibold text-blue-600">{subtitle}</h2>
			<p className="mt-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-balance">{title}</p>
			<p className="mt-6 text-lg font-medium text-zinc-600 leading-8">{intro}</p>
		</div>
	)
}
