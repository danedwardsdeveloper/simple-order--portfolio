export function subtleDelay(): Promise<void> {
	const minDelay = 500
	const maxDelay = 1500
	const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, randomDelay)
	})
}
