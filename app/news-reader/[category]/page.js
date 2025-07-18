import Link from "next/link"

export default function CategoryPage({ params }) {
  const { category } = params
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8 capitalize">{category} News Page</h2>
      <p className="text-muted-foreground mb-6">This page displays articles for the "{category}" category.</p>
      <Link href="/news-reader">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
