import Link from "next/link"
import Header from "@/components/UI/header"

export default function AdSalesPage() {
  return (
    <div>
      <Header/>
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">OVERVIEW</h2>
      <p className="text-muted-foreground mb-6">This page is for overview.</p>
      <Link href="/print-media">
        <button variant="outline">Back to Print Media Home</button>
      </Link>
    </div>
    </div>
  )
}
