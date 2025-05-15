export function subtleDelay(minDelay = 500, maxDelay = 1500): Promise<void> {
	const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, randomDelay)
	})
}
