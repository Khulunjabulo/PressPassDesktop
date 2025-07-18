import Link from "next/link"


export default function OthersPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Other News Page</h2>
      <p className="text-muted-foreground mb-6">This page is for miscellaneous news categories.</p>
      <Link href="/news-reader">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
