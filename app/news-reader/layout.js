'use client'

import NewsReaderFooter from "@/components/news-reader/NewsReaderFooter"
// import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader"

function NewsReaderLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <NewsReaderHeader/> */}
      <main className="flex-grow">{children}</main>
      <NewsReaderFooter/>
    </div>
  )
}

export default NewsReaderLayout;
