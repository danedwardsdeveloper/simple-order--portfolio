import type { months } from '@/library/constants'

export type Year = 2025 | 2026 | 2027

export type Month = (typeof months)[keyof typeof months]
