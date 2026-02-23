'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/UI/header";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import { Users, TrendingUp, DollarSign, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Partner() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Partner with Press Pass
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Allow Press Pass to find advertisers for your publication. Earn 50% of the revenue while we handle the advertising operations.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">50% Revenue Share</h3>
              <p className="text-gray-600">
                Earn half of all advertising revenue generated through your publication. No hidden fees, transparent payouts.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Targeted Advertisers</h3>
              <p className="text-gray-600">
                We match relevant advertisers with your audience, ensuring quality ads that resonate with your readers.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track your ad performance with real-time analytics. See impressions, clicks, and earnings at a glance.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sign Up</h4>
                <p className="text-sm text-gray-600">Create your publisher account and set up your publication profile</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Set Ad Spaces</h4>
                <p className="text-sm text-gray-600">Define available ad placements and pricing for your publication</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">We Find Advertisers</h4>
                <p className="text-sm text-gray-600">Our team connects you with relevant advertisers for your audience</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Earn Revenue</h4>
                <p className="text-sm text-gray-600">Receive 50% of all advertising revenue automatically</p>
              </div>
            </div>
          </div>

          {/* Ad Placement Options */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 sm:p-12 text-white mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Available Ad Placements</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">Headline Banner</h4>
                <p className="text-blue-100 text-sm mb-3">728x90 (Desktop) / 320x50 (Mobile)</p>
                <p className="text-white/90 text-sm">Prime position at the top of articles</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">In-Feed Ads</h4>
                <p className="text-blue-100 text-sm mb-3">300x250</p>
                <p className="text-white/90 text-sm">Native ads within content feed</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">Within Article</h4>
                <p className="text-blue-100 text-sm mb-3">300x250</p>
                <p className="text-white/90 text-sm">Embedded within article content</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">Sidebar Ads</h4>
                <p className="text-blue-100 text-sm mb-3">160x600 / 300x600</p>
                <p className="text-white/90 text-sm">Vertical sidebar placements</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">Page Wraps</h4>
                <p className="text-blue-100 text-sm mb-3">Custom dimensions</p>
                <p className="text-white/90 text-sm">Full page background ads</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-2">Mobile Banners</h4>
                <p className="text-blue-100 text-sm mb-3">320x50 / 300x250</p>
                <p className="text-white/90 text-sm">Mobile-optimized placements</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our partner network today and start earning from your publication's ad spaces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/print-media/monetization/advertise"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Set Up Ad Spaces
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/print-media/monetization/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Dashboard
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Questions? Contact us at <a href="mailto:partners@presspass.com" className="text-blue-600 hover:underline">partners@presspass.com</a>
            </p>
          </div>
        </div>
      </div>
      <PrintMediaFooter />
    </>
  );
}