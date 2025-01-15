import clsx from 'clsx'

export default function InviteCustomerButton({ classes }: { classes?: string }) {
  return <button className={clsx('px-2 bg-slate-200 rounded', classes)}>Invite customer</button>
}
