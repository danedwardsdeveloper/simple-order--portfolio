import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/shadcn/dropdown-menu'
import { orderStatus } from '@/library/constants'
import { capitaliseFirstLetter } from '@/library/utilities'
import type { OrderStatus } from '@/types'
import { CheckCircle, ChevronDown, Clock, XCircle } from 'lucide-react'

interface OrderStatusDropdownProps {
	statusOptions: OrderStatus[]
	currentStatus: OrderStatus
	onStatusChange: (newStatus: OrderStatus) => void
}

export default function OrderStatusDropdown({ statusOptions, currentStatus, onStatusChange }: OrderStatusDropdownProps) {
	function StatusIcon({ status }: { status: OrderStatus }) {
		switch (status) {
			case orderStatus.pending:
				return <Clock className="mr-2 h-4 w-4 text-yellow-500" />
			case orderStatus.completed:
				return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
			case orderStatus.cancelled:
				return <XCircle className="mr-2 h-4 w-4 text-red-500" />
			default:
				return null
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button type="button" className="flex items-center justify-between px-2 button-tertiary">
					<span className="flex items-center">
						<StatusIcon status={currentStatus} />
						{capitaliseFirstLetter(currentStatus)}
					</span>
					<ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="">
				{statusOptions.map((status) => (
					<DropdownMenuItem
						key={status}
						className={`flex items-center cursor-pointer ${status === currentStatus ? 'bg-gray-100 font-medium' : ''}`}
						disabled={status === currentStatus}
						onClick={() => onStatusChange(status)}
					>
						<StatusIcon status={status} />
						{capitaliseFirstLetter(status)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
