import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Required by ShadCN components
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Re-exported for personal use
export const mergeClasses = cn
