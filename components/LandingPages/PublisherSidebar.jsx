import Link from "next/link"
import Image from "next/image"


export function PublisherSidebar() {
  return (
    <aside className="w-64 bg-card text-card-foreground p-6 shadow-lg min-h-screen">
      <div className="mb-6">
        <div>
          <div className="text-xl">Publisher Tools</div>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/print-media/ad-sales">
            <button variant="ghost" className="w-full justify-start">
              Ad Sales
            </button>
          </Link>
          <Link href="/print-media/payment-method">
            <button variant="ghost" className="w-full justify-start">
              Payment Method
            </button>
          </Link>
        <Link href="/print-media/payment-method">
            <button variant="ghost" className="w-full justify-start">
              Print media home
            </button>
        </Link>
        </div>
      </div>
      <Link href="/">
        <button variant="outline" className="w-full bg-transparent flex justify-center">
          <Image
            src="\press-pass.png"
            alt="PressPass Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </button>
      </Link>
    </aside>
  )
}
