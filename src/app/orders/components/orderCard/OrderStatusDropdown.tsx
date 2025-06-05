import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/shadcn/dropdown-menu'
import { mergeClasses } from '@/library/utilities/public'
import type { OrderStatusName } from '@/types'
import { ChevronDown } from 'lucide-react'
import OrderStatusIcon from './OrderStatusIcon'

interface OrderStatusDropdownProps {
	statusOptions: OrderStatusName[]
	currentStatus: OrderStatusName
	onStatusChange: (newStatus: OrderStatusName) => void
}

export function OrderStatusDropdown({ statusOptions, currentStatus, onStatusChange }: OrderStatusDropdownProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center justify-between px-2 button-tertiary">
					<OrderStatusIcon status={currentStatus} />
					<ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{statusOptions.map((status) => (
					<DropdownMenuItem
						key={status}
						className={mergeClasses('mb-1 cursor-pointer', status === currentStatus && 'bg-gray-100 font-medium')}
						disabled={status === currentStatus}
						onClick={() => onStatusChange(status)}
					>
						<OrderStatusIcon status={status} />
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
