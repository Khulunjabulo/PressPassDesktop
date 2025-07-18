import Link from "next/link"

export default function AdSalesPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Ad Sales Page</h2>
      <p className="text-muted-foreground mb-6">This page is for managing ad sales.</p>
      <Link href="/print-media">
        <button variant="outline">Back to Print Media Home</button>
      </Link>
    </div>
  )
}
