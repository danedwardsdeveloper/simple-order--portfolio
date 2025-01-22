export default function MenuContainer({ children }: { children: React.ReactNode }) {
  return (
    <nav className="fixed inset-x-0 top-0 flex h-14 bg-white/70 backdrop-blur border-b-2 border-neutral-100 z-menubar">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between">{children}</div>
    </nav>
  )
}
