'use client'

const formItems = ['Name', 'SKU', 'Description', 'Price', 'VAT']

export default function AddInventoryForm() {
  function FormField({ name }: { name: string }) {
    return (
      <div className="">
        <label htmlFor="" className="block mb-1">
          {name}
        </label>
        <input type="text" className="w-full" />
      </div>
    )
  }

  return (
    <form action="submit" className="p-4 border-2 border-zinc-200 rounded-xl flex flex-col gap-y-4 max-w-xl -mx-3">
      <h2 className="">Add an item</h2>
      {formItems.map(item => (
        <FormField key={item} name={item} />
      ))}
      <div className="flex justify-center mt-8">
        <button className="button-secondary w-full">Add item</button>
      </div>
    </form>
  )
}
