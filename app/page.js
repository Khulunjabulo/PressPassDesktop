"use client";
import { Users, Megaphone, MessageSquare, User, BarChart3, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnimatedSlogan from "@/components/news-reader/AnimatedSlogan";
import MainHeader from "@/components/news-reader/NewsReaderMainHeader";
import UserReviewsSection from "@/components/user review/UserReviewSection";
import "../app/globals.css"

import React from "react";
import useLandingPageLogic from "@/hooks/LandingPageLogic";


  
export default function NewsReaderHomePage() {
  const { handleStartReading } = useLandingPageLogic()

  return (

    <div>
      <MainHeader/>

      <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        {/* Hero Section */}
        <section className="w-full relative bg-gray-50 py-8 sm:py-12 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-3 sm:mb-4 leading-tight">
                  STAY INFORMED.
                  <br />
                  STAY LOCAL.
                </h1>
                <div className="mb-4 sm:mb-6">
                  <AnimatedSlogan/>
                </div>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">
                  Press Pass brings South Africa's diverse community media together — empowering you with credible,
                  hyper-local news at your fingertips.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                    <div>START</div>
                    <div>READING</div>
                    <div>FREE</div>
                  </div>
                  <button
                    onClick={handleStartReading}
                    className="bg-[#329ae1] hover:bg-[#6aa9d3] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors"
                  >
                    Start to read
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-md mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">18.5M+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total readers</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">5.5M+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Daily readers</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">22+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Newspapers</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start lg:pl-12 xl:pl-16 mt-6 lg:mt-0">
                <div className="relative max-w-xs lg:max-w-sm">
                  <Image
                    src="/Mobile.png"
                    alt="Press-Pass mobile app interface showing local community news"
                    width={200}
                    height={400}
                    className="w-full h-auto max-w-[200px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[280px] xl:max-w-[300px] rounded-3xl shadow-2xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Use Section */}
        <section className="w-full py-10 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-black mb-8 sm:mb-12 lg:mb-16">Why Use Press Pass?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[{
                icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "Stay Connected",
                subtitle: "to your Community",
                description: "Follow news that matters from community papers, regional newsletters, and grassroots outlets."
              }, {
                icon: <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "One Platform.",
                subtitle: "Hundreds of Voices.",
                description: "Discover diverse perspectives from trusted local sources — all in one app."
              }, {
                icon: <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "Support Independent",
                subtitle: "Journalism",
                description: "Your views and subscriptions empower community journalists across South Africa."
              }].map((item, idx) => (
                <div key={idx} className="border-2 border-[#ffbd59] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6 lg:p-8 text-center">
                    {item.icon}
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-1 sm:mb-2">{item.title}</h3>
                    <h4 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">{item.subtitle}</h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-10 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-black mb-8 sm:mb-12 lg:mb-16">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[{
                icon: <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "Sign up for free.",
                description: "Create your profile in seconds."
              }, {
                icon: <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "Choose your communities.",
                description: "Follow publications that matter to you."
              }, {
                icon: <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#329ae1] mx-auto mb-3 sm:mb-4" />,
                title: "Get fresh local news.",
                description: "Curated, relevant, and reliable updates daily."
              }].map((item, idx) => (
                <div key={idx} className="border-2 border-[#ffbd59] bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6 lg:p-8 text-center">
                    {item.icon}
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Publications */}
        <section className="w-full py-10 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-black mb-8 sm:mb-12 lg:mb-16">Featured publications</h2>
            <div className="grid grid-cols-2 sm:flex sm:justify-center sm:items-center gap-4 sm:gap-6 lg:gap-12 sm:flex-wrap">
              <div className="text-lg sm:text-xl lg:text-2xl font-serif text-[#329ae1] font-bold text-center">The MERCURY</div>
              <div className="bg-[#329ae1] text-white px-3 py-2 sm:px-4 font-bold text-center rounded text-sm sm:text-base">The Herald</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 text-center">RISING SUN</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 italic text-center">isolezwe</div>
            </div>
          </div>
        </section>

        <UserReviewsSection/>

        {/* Download App CTA */}
        <section className="w-full py-8 sm:py-10 bg-gray-50 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">Prefer mobile?</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">Download the Press Pass app for a better on-the-go experience.</p>
            <button className="bg-[#329ae1] hover:bg-[#287dbf] text-white px-5 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
              Download App
            </button>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full bg-[#329ae1] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">Ready to read smarter, local news?</h2>
            <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base max-w-2xl mx-auto">Join thousands of South Africans switching to community-first media.</p>
            <div className="flex justify-center gap-3 sm:gap-4">
              {["in", "@", "f"].map((char, idx) => (
                <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffbd59] rounded flex items-center justify-center hover:bg-[#ffbd59]/90 transition-colors cursor-pointer">
                  <span className="text-white font-bold text-sm sm:text-base">{char}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

          </div>
  );
}