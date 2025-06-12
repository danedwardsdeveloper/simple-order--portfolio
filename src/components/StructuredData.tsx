import type { Thing, WithContext } from 'schema-dts'

export function StructuredData<T extends Thing>({
	data,
}: {
	data: WithContext<T>
}) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <build-time only>
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data),
			}}
		/>
	)
}
