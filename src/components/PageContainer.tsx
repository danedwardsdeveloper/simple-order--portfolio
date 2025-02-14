export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="max-w-4xl w-full mx-auto mt-menubar-offset px-4 lg:px-0 pt-8 pb-60">{children}</div>
}
