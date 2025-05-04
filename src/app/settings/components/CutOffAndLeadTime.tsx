'use client'
import type { SettingsPATCHbody, SettingsPATCHresponse } from '@/app/api/settings/route'
import { userMessages } from '@/library/constants'
import { apiRequest, epochDateToTimeInput, formatTime, timeInputToEpochDate } from '@/library/utilities/public'
import { useNotifications } from '@/providers/notifications'
import { useUser } from '@/providers/user'
import { useState } from 'react'

export function CutOffAndLeadTime() {
	const { user, setUser: _setUser } = useUser()
	const { createNotification } = useNotifications()

	const [editCutOff, setEditCutOff] = useState(false)
	const [newCutOff, setNewCutOff] = useState<Date>()

	const [editLeadTime, setEditLeadTime] = useState(false)
	const [newLeadTime, setNewLeadTime] = useState<number>()

	if (!user || user.roles === 'customer' || !user.cutOffTime) return null

	async function saveSettings(type: 'cutOffTime' | 'leadTimeDays') {
		let body: SettingsPATCHbody
		if (type === 'cutOffTime') {
			if (!newCutOff) return null
			body = { cutOffTime: newCutOff }
		} else {
			body = { leadTimeDays: newLeadTime }
		}

		try {
			const { userMessage } = await apiRequest<SettingsPATCHresponse, SettingsPATCHbody>({
				basePath: '/settings',
				method: 'PATCH',
				body,
			})

			// Get response.ok from apiRequest

			if (!userMessage) {
				// Update user conditionally...
				// Main ToDo!
				// setUser((prevUser) => {
				// 	if (!prevUser) return prevUser
				// 	return {
				// 		...prevUser,
				// 		cutOffTime: newCutOff ? newCutOff : new Date(),
				// 		leadTimeDays: newLeadTime ? newLeadTime : null,
				// 	}
				// })

				createNotification({
					title: 'Success',
					level: 'success',
					message: 'Settings updated',
				})
			}

			// ToDo: only set the one that was edited!
			setEditCutOff(false)
			setEditLeadTime(false)

			if (userMessage) {
				createNotification({
					title: 'Error',
					level: 'error',
					message: userMessage,
				})
			}
		} catch {
			createNotification({
				title: 'Error',
				level: 'error',
				message: userMessages.serverError,
			})
		}
	}

	return (
		<div className="w-full max-w-md border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-y-3">
			<div>
				<p className="font-medium">Order cut off time</p>
				<div className="flex justify-between min-h-12">
					{(() => {
						if (editCutOff) {
							return (
								<>
									<input
										type="time"
										id="cutOffTime"
										value={epochDateToTimeInput(newCutOff || user.cutOffTime)}
										onChange={(event) => {
											const timeInputValue = event.target.value
											const updatedDate = timeInputToEpochDate(timeInputValue)
											setNewCutOff(updatedDate)
										}}
									/>
									<button type="button" onClick={() => saveSettings('cutOffTime')} className="px-2 py-1 bg-blue-300 rounded">
										Save
									</button>
								</>
							)
						}
						if (!editCutOff) {
							return (
								<>
									<span>{formatTime(user.cutOffTime)}</span>
									<button
										type="button" //
										onClick={() => setEditCutOff(true)}
										className="link-primary"
									>
										Edit
									</button>
								</>
							)
						}
					})()}
				</div>
			</div>

			<div>
				<p className="font-medium">Lead days</p>
				<div className="flex justify-between min-h-12">
					{(() => {
						if (editLeadTime) {
							return (
								<>
									<input
										type="number"
										min="0"
										className="w-16 px-2 py-1 border rounded"
										value={newLeadTime !== undefined ? newLeadTime : user.leadTimeDays || 0}
										onChange={(event) => {
											const value = Number.parseInt(event.target.value, 10)
											setNewLeadTime(value)
										}}
									/>
									{(() => {
										// ToDo: This is complicated and needs to work properly!

										// Falsy newLeadTime is undefined, while falsy user.leadTimeDays is null, so they can't be compared directly
										const noLeadTimeChanges =
											(!newLeadTime && user.leadTimeDays !== undefined) ||
											(!newLeadTime && !user.leadTimeDays) ||
											newLeadTime === user.leadTimeDays

										if (noLeadTimeChanges) {
											return (
												<button
													type="button" //
													onClick={() => setEditLeadTime(false)}
													className="link-primary"
												>
													Cancel
												</button>
											)
										}
										return (
											<button
												type="button" //
												onClick={() => saveSettings('leadTimeDays')}
												className="px-2 py-1 bg-blue-300 rounded"
											>
												Save
											</button>
										)
									})()}
								</>
							)
						}

						if (!editLeadTime) {
							return (
								<>
									<span>{`${user.leadTimeDays || 0} days`}</span>
									<button
										type="button" //
										onClick={() => setEditLeadTime(true)}
										className="link-primary"
									>
										Edit
									</button>
								</>
							)
						}
					})()}
				</div>
			</div>
			<p>User lead days: {user.leadTimeDays}</p>
			<p>New state: {newLeadTime}</p>
		</div>
	)
}
