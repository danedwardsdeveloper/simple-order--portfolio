import { dynamicBaseURL } from '@/library/environment/publicVariables'
import urlJoin from 'url-join'

export function createInvitationURL(token: string): string {
	// Remember this is a link to the front-end, which then passes the token to the server
	return urlJoin(dynamicBaseURL, 'accept-invitation', token)
}
