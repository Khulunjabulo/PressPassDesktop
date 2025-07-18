import Link from "next/link"

export default function AdSalesPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Payment Method</h2>
      <p className="text-muted-foreground mb-6">This page is for managing Payment.</p>
      <Link href="/">
        <button variant="outline">Back to Print Media Home</button>
      </Link>
    </div>
  )
}
