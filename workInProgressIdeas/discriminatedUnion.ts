// type DiscriminatedUnion =
// 	| { accessDenied: { message: string }; userId?: never } //
// 	| { accessDenied?: never; userId: number }

// function checkPassword(password: string): DiscriminatedUnion {
// 	if (password === 'secret') return { userId: 123 }
// 	return { accessDenied: { message: 'Invalid password' } }
// }

// const { userId, accessDenied } = checkPassword('wrong')

// if (accessDenied) {
// 	accessDenied.message // This is a guaranteed string
// } else {
// 	userId // This is a guaranteed number
// }
