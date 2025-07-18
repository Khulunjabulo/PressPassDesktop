import Link from "next/link"

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
      <p className="text-muted-foreground mb-6">Could not find the requested article.</p>
      <Link href="/news-reader">
        <button>Return to News</button>
      </Link>
    </div>
  )
}
