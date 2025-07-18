import Link from "next/link"



export default function SearchPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Search here</h2>
      <p className="text-muted-foreground mb-6">search for any page you want.</p>
      <Link href="/news-reader">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
