'use client'

import React from 'react'
import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'

export default function AdvancedAnalytics() {
    return (
        <> 
            <Header />
            <div className="flex">
                <PublisherSidebar />
                <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Advanced Analytics</h1>
                        <div />
                        <div />
                        <div />
                    </div>
                </div>
            </div>
        </>
    );
}
