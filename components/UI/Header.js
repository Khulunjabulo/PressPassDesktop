import Link from "next/link"

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">
        Press Pass
      </Link>
      <nav>
        <ul className="flex gap-6">
          <li>
            <Link href="/news-reader" className="hover:underline">
              News Reader
            </Link>
          </li>
          <li>
            <Link href="/print-media" className="hover:underline">
              Print Media
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
