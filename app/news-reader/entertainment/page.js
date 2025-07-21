import Link from "next/link"
import NewsReaderHeader from "@/components/UI/NewsReaderHeader"

export default function EntertainmentPage() {
  return (
    <div>
    <NewsReaderHeader/>
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">Entertainment News Page</h2>
      <p className="text-muted-foreground mb-6">This page is for entertainment-related news.</p>
      <Link href="/">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
    </div>
  )
}
