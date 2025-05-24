import { isProduction } from '@/library/environment/publicVariables'
import { notFound } from 'next/navigation'

export default function Page() {
	if (isProduction) return notFound()

	return <h1>ToDo</h1>
}
