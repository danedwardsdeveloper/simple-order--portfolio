export interface CustomerGridItem {
  name: string
  email: string
}

export default function Customer({ name, email }: CustomerGridItem) {
  return (
    <div className="flex justify-between">
      <span>{name}</span>
      <span className="text-zinc-600">{email}</span>
    </div>
  )
}
