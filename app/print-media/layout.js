export default function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
     {/** <PublisherSidebar />*/ }
      <main className="flex-grow w-full">{children}</main>
    </div>
  )
}
