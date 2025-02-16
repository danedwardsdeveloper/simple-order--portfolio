export function formatPrice(pence: number): string {
	if (pence < 100) {
		return `${pence}p`
	}

	const pounds = pence / 100
	if (Number.isInteger(pounds)) {
		return `£${pounds}`
	}

	return `£${pounds.toFixed(2)}`
}
