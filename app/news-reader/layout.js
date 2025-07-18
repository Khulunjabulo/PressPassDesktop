import { NewsReaderNavbar } from "@/components/LandingPages/NewsReaderNavbar"

export default function NewsReaderLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <NewsReaderNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
