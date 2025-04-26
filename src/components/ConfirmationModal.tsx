"use client";
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export default function ConfirmationModal({
	title,
	content,
	confirmButtonContent,
	isOpen,
	onClose,
	onConfirm,
	dataTestId,
}: {
	title: string;
	content: ReactNode;
	confirmButtonContent: ReactNode;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
	dataTestId: string;
}) {
	async function handleConfirm() {
		await onConfirm();
		onClose();
	}

	return (
		<Dialog
			data-test-id={dataTestId}
			open={isOpen}
			onClose={onClose}
			className="relative z-modal"
		>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-modal w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel
						transition
						className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
					>
						<div className="sm:flex sm:items-start">
							<div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:size-10">
								<ExclamationTriangleIcon
									aria-hidden="true"
									className="size-6 text-orange-600"
								/>
							</div>
							<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<DialogTitle
									as="h3"
									className="text-base font-semibold text-gray-900"
								>
									{title}
								</DialogTitle>
								<div className="mt-2">
									<p className="text-sm text-gray-500">{content}</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:justify-center">
							<button
								type="button"
								onClick={handleConfirm}
								className="button-primary w-auto sm:ml-3"
							>
								{confirmButtonContent}
							</button>
							<button
								type="button"
								data-autofocus
								onClick={onClose}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							>
								Cancel
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
