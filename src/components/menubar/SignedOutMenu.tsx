import Link from 'next/link'

import CompanyLogo from '../Icons'
import HomePageLink from './HomePageLink'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'

export default function SignedOutMenu() {
  return (
    <MenuContainer>
      <HomePageLink />
      <div className="flex h-full items-center gap-x-6">
        <MenuItem href="/articles" text="Blog" />
        <MenuItem href="/sign-in" text="Sign in" />
        <div className="flex gap-x-2 items-center">
          <Link
            href="#"
            className="bg-white text-zinc-600 hover:text-blue-400 active:text-blue-500 hover:bg-neutral-100 active:bg-neutral-200 rounded-lg px-2 py-1 font-medium text-sm border-2 border-blue-200 hover:border-blue-300 active:border-blue-400 transition-colors duration-300"
          >
            Learn more
          </Link>
          <Link
            href="#"
            className="bg-blue-400 hover:bg-blue-400 active:bg-blue-500 text-white rounded-lg px-2 py-1 font-medium text-sm border-2 border-blue-400 hover:border-blue-500 active:border-blue-700 transition-colors duration-300"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </MenuContainer>
  )
}
