'use client'

import { withRoleProtection } from '@/lib/authHelpers';
import PublisherSidebar from '@/components/UI/publisherSidebar';

function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
      
      <main className="flex-grow w-full">{children}</main>
    </div>
  )
}

export default withRoleProtection(PrintMediaLayout, 'publisher');
