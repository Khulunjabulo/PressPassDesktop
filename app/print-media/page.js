"use client"

import Image from 'next/image'
import {
  Globe,
  Wallet,
  ShieldCheck,
  Settings,
  Inbox,
  Link as LinkIcon,
  DollarSign,
  Monitor,
  BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import "../globals.css"
import React from "react";
import PrintMediaUserReviewCard from '@/components/user review/PrintMediaUserReview';
import PrintMediaHeader from '@/components/Print-mediaUI/header'


export default function Home() {
  return (
    <div className='bg-gray-50 overflow-hidden'>
      {/* Header */}
      <PrintMediaHeader/>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-12 max-w-6xl mx-auto min-h-[80vh]">
      <div className="md:w-1/2 flex flex-col justify-center h-full">
        <h2 className="text-5xl lg:text-6xl font-bold text-black mb-4">
          Grow Your Reach. <br />
          Keep Your Voice. <br />
          Get Paid Fairly.
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg">
          Press Pass helps South African online community publications reach their audience,
          earn recurring income, and stay independent without extra work.
        </p>
        <Link href="/signup">
          <button className="bg-[#329ae1] hover:bg-[#6aa9d3] text-white px-8 py-3 rounded-full">
            Join as a Publisher
          </button>
        </Link>
      </div>
      <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center items-center h-full">
        <Image
          src="/hero section.png"
          alt="Hero"
          className="rounded-lg w-full max-w-lg max-h-[600px] object-contain"
          priority
          width={300}
          height={600}
        />
      </div>
      </section>


      {/* Why Use Press Pass */}
      <section className="py-12 w-full relative bg-gray-50">
        <h3 className="text-4xl font-bold text-center text-black mb-16">Why Use Press Pass?</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 p-6 max-w-7xl mx-auto">
          {[
            { icon: <Globe size={40} />, title: 'Reach a wider Audience', text: 'Your stories get access to our publishing platform and mobile app.' },
            { icon: <Wallet size={40} />, title: 'Monetize Your Work', text: 'Earn revenue through subscriptions and incentives.' },
            { icon: <ShieldCheck size={40} />, title: 'Stay Independent', text: 'Keep full editorial control and build your brand.' },
            { icon: <Settings size={40} />, title: 'Simplified Tech', text: 'We handle the infrastructure so you can focus on content.' }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-l-4"
              style={{ borderLeftColor: '#FFD700' }} 
            >
              <div className="text-pressblue mb-4 text-3xl flex justify-center">{item.icon}</div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-700 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>



        {/* How It Works */}
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-black mb-16">How it works</h3>

          {/* Step Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {[
              { icon: <Inbox size={32} />, title: 'Apply or Get Invited', text: "We'll onboard you according to your needs." },
              { icon: <LinkIcon size={32} />, title: 'Connect Your Feed or Post', text: 'Post stories and grow traffic.' },
              { icon: <DollarSign size={32} />, title: 'Start Earning & Growing', text: 'Get paid monthly with full analytics.' }
            ].map((step, i) => (
              <div
                key={i}
                className="p-6 border-l-4 border-yellow-500 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-pressblue mb-4 flex justify-center">{step.icon}</div>
                <h4 className="text-lg font-bold text-center mb-2">{step.title}</h4>
                <p className="text-gray-600 text-center">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-center shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200 font-bold">
                <tr>
                  <th className="p-3">Publications</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['News24', '121', '112'],
                  ['The Herald', '114', '106'],
                  ['NEWS SUD', '108', '105'],
                  ['The Mercury', '103', '100']
                ].map(([name, views, earnings], idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 font-semibold">{name}</td>
                    <td className="p-3">{views}</td>
                    <td className="p-3">{earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quote */}
          <p className="text-center mt-10 text-black-600 font-semibold">
            Trusted by Publishers Across South Africa
          </p>
          <p className="text-center text-gray-500 italic">
            "PressPass gave our paper digital reach we never thought possible"
          </p>
        </section>


      {/* Tools and Support */}
      <section className="bg-gray-50 py-12">
        <h3 className="text-4xl font-bold text-center text-black mb-16">Tools and Support you Get</h3>
        <div className="flex justify-center gap-12 text-center">
          <div>
            <Monitor size={32} className="mx-auto text-pressblue mb-1" />
            <p>Publish Dashboard</p>
          </div>
          <div>
            <BarChart2 size={32} className="mx-auto text-pressblue mb-1" />
            <p>Analytics & Engagement Reports</p>
          </div>
        </div>  

        <section className='py-10'>
          <PrintMediaUserReviewCard/>
        </section>

      </section>

      {/* Footer */}
              <section className="w-full bg-[#329ae1] py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to read smarter, local news?</h2>
            <p className="text-white/90 mb-8">Join thousands of South Africans switching to community-first media.</p>
            <div className="flex justify-center gap-4">
              {["in", "@", "f"].map((char, idx) => (
                <div key={idx} className="w-10 h-10 bg-[#ffbd59] rounded flex items-center justify-center">
                  <span className="text-white font-bold">{char}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  )
}


