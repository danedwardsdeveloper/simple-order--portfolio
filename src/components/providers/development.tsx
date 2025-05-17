import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

const DevelopmentProviderContext = createContext<boolean | undefined>(undefined)

export function DevelopmentProvider({ children }: { children: ReactNode }) {
	const [value, setValue] = useState(true)

	useEffect(() => {
		const timer = setInterval(() => {
			setValue((prev) => !prev)
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	return <DevelopmentProviderContext.Provider value={value}>{children}</DevelopmentProviderContext.Provider>
}

export function useAlternatingBoolean() {
	const context = useContext(DevelopmentProviderContext)

	if (context === undefined) {
		throw new Error('alternatingBoolean must be used within a DevelopmentProvider')
	}

	return context
}
