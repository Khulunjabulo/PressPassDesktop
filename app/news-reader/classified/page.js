import Link from "next/link"



export default function ClassifiedPage() {
  return (
    <div className="py-8 text-center">
      <h2 className="text-4xl font-bold mb-8">classified Page</h2>
      <p className="text-muted-foreground mb-6">Find your classified in this page</p>
      <Link href="/">
        <button variant="outline">Back to News Home</button>
      </Link>
    </div>
  )
}
