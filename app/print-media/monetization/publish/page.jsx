'use client';

import Header from "@/components/UI/header";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import { FileText, DollarSign, TrendingUp, Users, CheckCircle, ArrowRight, Upload, Eye, BarChart } from "lucide-react";
import Link from "next/link";

export default function Publish() {
  const contentTypes = [
    { icon: FileText, title: "Sponsored Articles", desc: "Brand stories and promotional content" },
    { icon: Users, title: "Local Business Stories", desc: "Community business highlights" },
    { icon: TrendingUp, title: "Product Reviews", desc: "Detailed product evaluations" },
    { icon: BarChart, title: "Industry Reports", desc: "Professional research and insights" },
  ];

  const benefits = [
    "Earn 85% of revenue generated from your content",
    "CPM of R250.00 for all published content",
    "Full editorial control and content approval",
    "Real-time analytics and performance tracking",
    "Transparent payment processing",
    "Direct deposit to your account"
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Your Content",
      description: "Write high-quality articles, stories, or reports that provide value to readers",
      icon: FileText
    },
    {
      step: 2,
      title: "Submit for Review",
      description: "Upload your content through our publisher dashboard for quick review",
      icon: Upload
    },
    {
      step: 3,
      title: "Get Published",
      description: "Once approved, your content goes live on Press Pass immediately",
      icon: Eye
    },
    {
      step: 4,
      title: "Earn Revenue",
      description: "Track impressions and earn R250 per 1,000 views on your content",
      icon: DollarSign
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Publish & Earn with Press Pass
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Publish sponsored articles, local business stories, and more. Earn 85% of revenue generated.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                  <span>CPM Rate:</span>
                  <span className="text-green-200">R250.00</span>
                </div>
                <p className="text-green-100 mt-2">per 1,000 impressions</p>
              </div>
              <Link
                href="/print-media/monetization/dashboard"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
              >
                Start Publishing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Content Types */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What You Can Publish</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <type.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Publisher Benefits</h2>
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 sm:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Guidelines */}
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Content Guidelines</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-4">✓ We Accept</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Original, well-researched content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Properly sourced and attributed information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Professional tone and formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Clear disclosure of sponsored content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Relevant and valuable to our audience</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-red-600 mb-4">✗ We Don't Accept</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Plagiarized or duplicate content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Misleading or false information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Offensive or inappropriate material</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Poorly written or low-quality content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Content violating copyright laws</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Revenue Calculator */}
          <div className="bg-green-50 rounded-xl border-2 border-green-200 p-8 sm:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Revenue Calculator</h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">10,000 impressions</span>
                  <span className="text-2xl font-bold text-green-600">R2,125</span>
                </div>
                <div className="text-sm text-gray-600">
                  (10,000 ÷ 1,000) × R250 × 85% = R2,125
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">50,000 impressions</span>
                  <span className="text-2xl font-bold text-green-600">R10,625</span>
                </div>
                <div className="text-sm text-gray-600">
                  (50,000 ÷ 1,000) × R250 × 85% = R10,625
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">100,000 impressions</span>
                  <span className="text-2xl font-bold text-green-600">R21,250</span>
                </div>
                <div className="text-sm text-gray-600">
                  (100,000 ÷ 1,000) × R250 × 85% = R21,250
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Publishing?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our publisher network and start earning from your quality content today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/print-media/monetization/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Go to Publisher Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/print-media/monetization/advertise"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Ad Templates
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Questions? Contact us at <a href="mailto:publishers@presspass.com" className="text-green-600 hover:underline">publishers@presspass.com</a>
            </p>
          </div>
        </div>
      </div>
      <PrintMediaFooter />
    </>
  );
}

// XCircle component (if not imported from lucide-react)
function XCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6M9 9l6 6"/>
    </svg>
  );
}