//import NewsReaderFooter from "@/components/news-reader/NewsReaderFooter"
import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader"

export default function NewsReaderLayout({ children }) {
  return (
    <div> 
      <NewsReaderHeader/>     
      <main>{children}</main>
      {/* <NewsReaderFooter/> */}
    </div>
  )
}
