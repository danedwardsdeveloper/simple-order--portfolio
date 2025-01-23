import Link from 'next/link'

import HomePageLink from './HomePageLink'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'

export default function SignedOutMenu() {
  return (
    <MenuContainer>
      <HomePageLink />
      <div className="flex h-full items-center gap-x-6">
        <MenuItem href="/articles" text="Articles" />
        <MenuItem href="/sign-in" text="Sign in" />
        <div className="flex gap-x-2 items-center">
          <Link href="/articles/how-it-works" className="button-cta-secondary">
            Learn more
          </Link>
          <Link href="/free-trial" className="button-cta-primary">
            Start free trial
          </Link>
        </div>
      </div>
    </MenuContainer>
  )
}
