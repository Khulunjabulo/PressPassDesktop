'use client'

import NewsReaderFooter from "@/components/news-reader/NewsReaderFooter"
// import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader"
import MobileBottomNav from "@/components/news-reader/MobileBottomNav";

function NewsReaderLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <NewsReaderHeader/> */}
      <main className="flex-grow pb-20 md:pb-0">{children}</main>
      <div className="hidden md:block">
        <NewsReaderFooter/>
      </div>
      <MobileBottomNav />
    </div>
  )
}

export default NewsReaderLayout;
