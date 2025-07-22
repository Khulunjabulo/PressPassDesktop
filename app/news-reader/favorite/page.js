import Link from "next/link"



export default function FavoritePage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Favorite Page</h2>
      <p className="text-muted-foreground mb-6">Add your favorite publications to favorite</p>
      <Link href="/">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
