import Header from "@/components/UI/header"
import Link from "next/link"
export default function analytics() {
  return (
    <div>
      <Header/>
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">ANALYTICS</h2>
      <p className="text-muted-foreground mb-6">This page is for Analytics.</p>
      <Link href="/print-media">
        <button variant="outline">Back to Print Media Home</button>
      </Link>
    </div>
    </div>
  )
}