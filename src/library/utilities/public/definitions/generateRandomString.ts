export function generateRandomString() {
	const characters = 'abcdefghijklmnopqrstuvwxyz'
	let result = ''
	for (let i = 0; i < 10; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length)
		result += characters[randomIndex]
	}
	return result
}
