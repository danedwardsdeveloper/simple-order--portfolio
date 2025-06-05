import { bareProductionDomain } from '@/library/environment/publicVariables'
import { Body, Container, Head, Heading, Html, Img, Link, Preview, Text } from '@react-email/components'
// biome-ignore lint/correctness/noUnusedImports: <Fails without specific import>
import React from 'react'
import { colours, companyLogoUrl } from '../constants'

export type ConfirmEmailProps = {
	loginCode?: string
	confirmationLink: string
	name: string
}

export const ConfirmEmail = (props: ConfirmEmailProps) => (
	<Html>
		<Head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="format-detection" content="telephone=no" />
		</Head>
		<Body style={main}>
			<Preview>Log in with this magic link</Preview>
			<Container style={container}>
				<Heading style={h1}>Hi {props.name}</Heading>
				<Text style={{ ...text, marginBottom: '14px' }}>Thank you for starting a free trial of Simple Order.</Text>
				<Link
					href={props.confirmationLink}
					target="_blank"
					style={{
						...link,
						display: 'block',
						marginBottom: '16px',
					}}
				>
					Please confirm your email
				</Link>
				<Text style={{ ...text, marginBottom: '14px' }}>Or, copy and paste this temporary login code:</Text>
				<code style={code}>{props.loginCode}</code>
				<Text
					style={{
						...text,
						color: colours.zinc[600],
						marginTop: '14px',
						marginBottom: '16px',
					}}
				>
					{`If you didn't try to login, you can safely ignore this email.`}
				</Text>
				<Text
					style={{
						...text,
						color: colours.zinc[600],
						marginTop: '12px',
						marginBottom: '38px',
					}}
				>
					Hint: You can set a permanent password in Settings & members → My account.
				</Text>
				<Img src={companyLogoUrl} width="32" height="32" alt="Notion's Logo" />
				<Text style={footer}>
					<Link href="https://notion.so" target="_blank" style={{ ...link, color: '#898989' }}>
						{bareProductionDomain}
					</Link>
					, the order
					<br />
					management website for wholesalers.
				</Text>
			</Container>
		</Body>
	</Html>
)

const main = {
	backgroundColor: '#ffffff',
}

const container = {
	paddingLeft: '12px',
	paddingRight: '12px',
	margin: '0 auto',
}

const h1 = {
	color: '#333',
	WebkitTextSizeAdjust: '100%',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '24px',
	fontWeight: 'bold',
	margin: '40px 0',
	padding: '0',
}

const link = {
	color: '#2754C5',
	WebkitTextSizeAdjust: '100%',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	textDecoration: 'underline',
}

const text = {
	color: '#333',
	WebkitTextSizeAdjust: '100%',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	margin: '24px 0',
}

const footer = {
	color: colours.zinc[600],
	WebkitTextSizeAdjust: '100%',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	lineHeight: '22px',
	marginTop: '12px',
	marginBottom: '24px',
}

const code = {
	display: 'inline-block',
	padding: '16px 4.5%',
	WebkitTextSizeAdjust: '100%',
	width: '90.5%',
	backgroundColor: '#f4f4f4',
	borderRadius: '5px',
	border: '1px solid #eee',
	color: '#333',
}

ConfirmEmail.PreviewProps = {
	loginCode: '1234-1234-1234-1234',
	confirmationLink: 'google.com',
	name: 'Jane',
} satisfies ConfirmEmailProps

export default ConfirmEmail
