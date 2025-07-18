import Link from "next/link"



export default function OpinionPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Opinion Pieces Page</h2>
      <p className="text-muted-foreground mb-6">This page is for opinion articles.</p>
      <Link href="/news-reader">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
