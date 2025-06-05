import type { BrowserSafeCompositeUser, DangerousBaseUser, FreeTrial, Roles, Subscription } from '@/types'
import { sanitiseDangerousBaseUser } from '../../public'

type Props = {
	dangerousUser: DangerousBaseUser //
	roles: Roles
	freeTrial: FreeTrial | null
	subscription: Subscription | null
}

export function createCompositeUser(props: Props): BrowserSafeCompositeUser {
	return {
		...sanitiseDangerousBaseUser(props.dangerousUser),
		roles: props.roles,
		trialEnd: props.freeTrial?.endDate || null,
		subscriptionEnd: props.subscription?.currentPeriodEnd || null,
		subscriptionCancelled: Boolean(props.subscription?.cancelledAt),
	}
}
