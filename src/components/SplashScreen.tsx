import clsx from 'clsx'

import CompanyLogo from './Icons'
import Spinner from './Spinner'

export default function SplashScreen({ show }: { show: boolean }) {
  return (
    // ToDo: Abstract the z-index
    <div
      data-component="SplashScreen"
      className={clsx(
        'fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-500 pointer-events-none',
        show ? 'opacity-100' : 'opacity-0',
      )}>
      <div className="flex items-center gap-x-4 h-12 text-blue-600">
        <div className="size-6 text-blue-600">
          <CompanyLogo />
        </div>
        <h1 className="text-2xl font-medium m-0">Simple Order</h1>
        <Spinner />
      </div>
    </div>
  )
}
