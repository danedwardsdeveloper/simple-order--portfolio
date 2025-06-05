export default function FormLabel({ htmlFor, text, errorMessage }: { htmlFor: string; text: string; errorMessage?: string }) {
	return (
		<div className="mb-1">
			<label htmlFor={htmlFor} className="block md:inline mb-0">
				{text}
			</label>
			{errorMessage && <span className="ml-0 md:ml-2 block md:inline md:mb-1 text-red-600">{errorMessage}</span>}
		</div>
	)
}
