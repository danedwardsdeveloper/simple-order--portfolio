'use client'
import ToggleWithLabel from '@/components/ToggleWithLabel'
import { useUi } from '@/providers/ui'

export default function VatToggleButton() {
	const { includeVat, toggleIncludeVat } = useUi()
	return (
		<div className="max-w-xl flex border-2 border-blue-200 p-3 lg:-mx-3 rounded-xl">
			<ToggleWithLabel enabled={includeVat} setEnabled={toggleIncludeVat} enabledLabel="Show VAT" disabledLabel="Hide VAT" />
		</div>
	)
}
