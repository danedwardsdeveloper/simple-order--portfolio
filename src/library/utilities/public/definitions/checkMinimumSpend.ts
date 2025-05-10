export function checkMinimumSpend({ minimumSpend, totalWithoutVAT }: { minimumSpend: number; totalWithoutVAT: number }): {
	minimumSpendReached: boolean
	percentageTowardsMinimumSpend: number
} {
	const minimumSpendReached = totalWithoutVAT >= minimumSpend

	let percentageTowardsMinimumSpend = 0

	if (minimumSpend > 0) {
		percentageTowardsMinimumSpend = Math.min((totalWithoutVAT / minimumSpend) * 100, 100)
	} else {
		percentageTowardsMinimumSpend = 100
	}

	return {
		minimumSpendReached,
		percentageTowardsMinimumSpend,
	}
}
