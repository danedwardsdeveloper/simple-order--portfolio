import PageContainer from '@/components/PageContainer'
import SignOutButton from './components/SignOutButton'

export default function SettingsPage() {
	return (
		<PageContainer>
			<div className="">
				<h1>Settings</h1>
				<SignOutButton />
			</div>
		</PageContainer>
	)
}
