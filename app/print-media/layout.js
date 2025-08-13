'use client'

import PublisherSidebar from '@/components/UI/publisherSidebar';

function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
      
      <main className="flex-grow w-full">{children}</main>
    </div>
  )
}

export default PrintMediaLayout;
