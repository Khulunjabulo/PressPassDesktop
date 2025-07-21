export default function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
