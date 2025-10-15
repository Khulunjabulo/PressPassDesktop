export default function NewsReaderLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="relative w-32 h-20 [perspective:1000px] flex">
        {/* Left Cover */}
        <div className="w-1/2 h-full bg-primary-700 rounded-l-lg"></div>

        {/* Pages */}
        <div className="absolute left-1/2 top-0 w-1/2 h-full origin-left">
          <div className="absolute inset-0 bg-white border border-gray-300 rounded-r-md animate-page-flip"></div>
          <div className="absolute inset-0 bg-gray-100 border border-gray-300 rounded-r-md animate-page-flip [animation-delay:0.3s]"></div>
          <div className="absolute inset-0 bg-gray-200 border border-gray-300 rounded-r-md animate-page-flip [animation-delay:0.6s]"></div>
        </div>

        {/* Right Cover */}
        <div className="w-1/2 h-full bg-primary-700 rounded-r-lg"></div>
      </div>

      <p className="mt-6 text-lg text-muted-foreground">Loading news...</p>
    </div>
  )
}
