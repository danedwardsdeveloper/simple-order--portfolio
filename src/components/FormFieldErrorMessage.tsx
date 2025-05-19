import type { FieldError } from 'react-hook-form'

export default function FormFieldErrorMessage(props: { error: FieldError | string | undefined }) {
	const { error } = props
	if (!error) return null

	return <p className="text-red-600 mt-2">{typeof error === 'string' ? error : error.message}</p>
}
