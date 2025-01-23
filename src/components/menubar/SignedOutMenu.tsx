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
            className="bg-white text-zinc-600 hover:text-blue-400 active:text-blue-500  rounded-lg px-2 py-1 font-medium text-sm border-2 border-blue-200 hover:border-blue-300 active:border-blue-400 transition-all duration-300 shadow active:shadow-none"
          >
            Learn more
          </Link>
          <Link
            href="#"
            className="bg-blue-500 hover:bg-blue-400 active:bg-blue-300 text-white rounded-lg px-2 py-1 font-medium text-sm border-2 border-blue-500 hover:border-blue-400 active:border-blue-300 transition-all duration-300 shadow active:shadow-none"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </MenuContainer>
  )
}
