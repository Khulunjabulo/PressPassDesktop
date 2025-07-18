import Link from "next/link"


export default function ArticlePage({ params }) {
  const { slug } = params
  return (
    <div className="py-8 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Article: {slug}</h1>
      <p className="text-muted-foreground mb-6">This is the detailed page for article "{slug}".</p>
      <Link href="/news-reader">
        <button variant="outline">Back to News</button>
      </Link>
    </div>
  )
}
