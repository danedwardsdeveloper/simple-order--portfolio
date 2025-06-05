import type { BrowserSafeInvitationReceived, BrowserSafeInvitationSent, DangerousBaseUser, Invitation, NonEmptyArray } from '@/types'
import { emptyToNull, obfuscateEmail } from '../../public'

interface Props {
	dangerousUser: DangerousBaseUser
	invitationRecords: NonEmptyArray<Invitation> | null
	profiles: NonEmptyArray<DangerousBaseUser> | null
}

export function mapInvitations(props: Props): {
	invitationsSent: NonEmptyArray<BrowserSafeInvitationSent> | null
	invitationsReceived: NonEmptyArray<BrowserSafeInvitationReceived> | null
} {
	if (!props.invitationRecords) {
		return { invitationsSent: null, invitationsReceived: null }
	}

	const profilesMap = new Map(props.profiles?.map((profile) => [profile.id, profile]) || [])

	const sent = props.invitationRecords
		.filter((invitation) => invitation.senderUserId === props.dangerousUser.id)
		.map((invitation) => ({
			obfuscatedEmail: obfuscateEmail(invitation.email),
			lastEmailSentDate: invitation.lastEmailSent,
			expirationDate: invitation.expiresAt,
		}))

	const received = props.invitationRecords
		.filter((invitation) => invitation.email === props.dangerousUser.email)
		.map((invitation) => {
			const sender = profilesMap.get(invitation.senderUserId)
			return sender
				? {
						merchantBusinessName: sender.businessName,
						expirationDate: invitation.expiresAt,
					}
				: null
		})
		.filter((item): item is BrowserSafeInvitationReceived => item !== null)

	return {
		invitationsSent: emptyToNull(sent),
		invitationsReceived: emptyToNull(received),
	}
}
