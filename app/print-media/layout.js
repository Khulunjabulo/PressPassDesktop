'use client'

import { withRoleProtection } from '@/lib/authHelpers';

function PrintMediaLayout({ children }) {
  return (
    <div className="flex">
      
      <main className="flex-grow w-full">{children}</main>
    </div>
  )
}

export default withRoleProtection(PrintMediaLayout, 'publisher');
