import { PublisherSidebar } from "@/components/LandingPages/PublisherSidebar"

export default function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
      <PublisherSidebar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
