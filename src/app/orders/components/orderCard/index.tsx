import ZebraListItem from '@/components/ZebraListItem'
import { orderStatusNames } from '@/library/constants'
import { type FormatOrderInput, formatOrder } from '@/library/utilities/public/definitions/formatOrder'
import type { OnStatusChangeRequest, OrderStatusName } from '@/types'
import { DeliveryDateInfo } from './DeliveryDateInfo'
import { OrderCardHeader } from './OrderCardHeader'
import { OrderNotes } from './OrderNotes'
import { OrderStatusDropdown } from './OrderStatusDropdown'
import OrderStatusIcon from './OrderStatusIcon'
import { DownloadPDFButton, OpenPDFButton } from './PrintButtons'

type Props = {
	onStatusChangeRequest: OnStatusChangeRequest
	includeVat: boolean
	index: number
} & FormatOrderInput

export default function OrderCard(props: Props) {
	const orderMadeCade = props.type === 'orderMade'

	const formatOrderInput: FormatOrderInput = orderMadeCade
		? {
				type: 'orderMade',
				order: props.order,
				merchantName: props.merchantName,
				currency: props.currency,
			}
		: {
				type: 'orderReceived',
				order: props.order,
				customerName: props.customerName,
				currency: props.currency,
			}

	// Entire object required by PrintButton
	const formattedOrder = formatOrder(formatOrderInput)

	const {
		idNumber,
		idString,

		statusName,

		requestedDeliveryDate,
		createdAt,
		updatedAt,

		merchantName,
		customerName,

		products,

		totalWithVAT,
		totalWithoutVAT,
		noVatOnOrder,
		vatOnly,

		adminOnlyNote,
		customerNote,
	} = formattedOrder

	const showVatInfo = !noVatOnOrder

	function StatusContent() {
		let statusOptions: OrderStatusName[] = []

		if (statusName === 'Pending') {
			if (orderMadeCade) {
				statusOptions = [orderStatusNames.Cancelled, orderStatusNames.Pending]
			} else {
				statusOptions = [orderStatusNames.Pending, orderStatusNames.Completed]
			}
		}

		if (!statusOptions || statusOptions.length <= 1) {
			return <OrderStatusIcon status={statusName} />
		}

		return (
			<OrderStatusDropdown
				statusOptions={statusOptions}
				currentStatus={statusName}
				onStatusChange={(newStatus) => props.onStatusChangeRequest(idNumber, statusName, newStatus)}
			/>
		)
	}

	return (
		<ZebraListItem index={props.index} dataComponent="OrderCard">
			<OrderCardHeader
				orderIdString={idString}
				businessName={orderMadeCade ? merchantName : customerName}
				statusContent={<StatusContent />}
			/>

			<DeliveryDateInfo requestedDeliveryDate={requestedDeliveryDate} updatedAt={updatedAt} createdAt={createdAt} />

			<OrderNotes adminOnlyNote={adminOnlyNote} customerNote={customerNote} />

			{/* Order items */}
			<h3 className="mt-8">Items</h3>
			<ul className="flex flex-col gap-y-6 divide-y-2 divide-zinc-200 mb-8">
				{products.map((item) => (
					<li key={item.id} className="flex flex-col pt-2 first:pt-4 pb-8">
						{/* Heading */}
						<div className="flex justify-between mb-3">
							<span className="text-xl">{item.name}</span>
							<div>
								<span className="text-zinc-600">x </span>
								<span className="text-xl">{item.quantity}</span>
							</div>
						</div>

						{/* Body */}
						<p>{item.itemPrice} each</p>
						<p>{item.vatPercentage}</p>
						<div className="text-right">
							<p className="text-zinc-700">Subtotal {props.includeVat ? 'with VAT' : 'without VAT'}</p>
							<p>{props.includeVat ? item.subtotalWithVat : item.subtotalWithoutVat}</p>
						</div>
					</li>
				))}
			</ul>
			<div className="w-full flex gap-x-3 items-end justify-end text-xl">
				<span className="text-zinc-600">{noVatOnOrder ? 'Total' : `Total ${props.includeVat ? 'with' : 'without'} VAT`}</span>
				<span className="font-medium">{props.includeVat ? totalWithVAT : totalWithoutVAT}</span>
			</div>

			{showVatInfo && props.includeVat && (
				<div className="w-full flex gap-x-3 items-end justify-end text-zinc-600 mt-1">
					<span>VAT</span>
					<span>{vatOnly}</span>
				</div>
			)}

			{!orderMadeCade && (
				<div className="flex justify-end gap-x-6">
					<OpenPDFButton orders={[formattedOrder]} />
					<DownloadPDFButton orders={[formattedOrder]} />
				</div>
			)}
		</ZebraListItem>
	)
}
