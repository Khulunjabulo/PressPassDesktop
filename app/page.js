
"use client";

import { Users, Megaphone, MessageSquare, User, BarChart3, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnimatedSlogan from "@/components/UI/AnimatedSlogan";
import MainHeader from "@/components/UI/NewsReaderMainHeader";

import React, { useState, useEffect } from "react";
import { auth } from "@/Firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function NewsReaderHomePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleStartReading = () => {
    if (user) {
      router.push("/news-reader");
    } else {
      router.push("/signin");
    }
  };

  return (

    <div>
      <MainHeader/>

      <div className="w-full min-h-screen bg-white overflow-x-hidden">
        {/* Hero Section */}
        <section className="w-full relative bg-[#e6e6e6] py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="text-6xl font-bold text-gray-400 transform rotate-12 absolute top-10 left-10">
              COAST TO COAST
            </div>
            <div className="text-4xl font-bold text-gray-400 transform -rotate-12 absolute bottom-20 right-20">
              LOCAL NEWS
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-black mb-4">
                  STAY INFORMED.
                  <br />
                  STAY LOCAL.
                </h1>
                <AnimatedSlogan/>
                <p className="text-gray-600 mb-8 max-w-lg">
                  Press Pass brings South Africa's diverse community media together — empowering you with credible,
                  hyper-local news at your fingertips.
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-sm text-gray-500">
                    <div>START</div>
                    <div>READING</div>
                    <div>FREE</div>
                  </div>
                  <button
                    onClick={handleStartReading}
                    className="bg-[#329ae1] hover:bg-[#3997d6] text-white px-8 py-3 rounded-full"
                  >
                    Start to read
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-black">18.5M+</div>
                    <div className="text-sm text-gray-600">Total news readers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-black">5.5M+</div>
                    <div className="text-sm text-gray-600">Daily news readers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-black">22+</div>
                    <div className="text-sm text-gray-600">Major daily newspapers</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-96 bg-[#329ae1] rounded-3xl shadow-2xl transform rotate-6"></div>
                  <div className="absolute -top-4 -left-4 w-64 h-96 bg-[#329ae1] rounded-3xl shadow-2xl">
                    <div className="p-4 text-white">
                      <div className="bg-white/20 rounded-lg p-3 mb-3">
                        <div className="h-2 bg-white/60 rounded mb-2"></div>
                        <div className="h-2 bg-white/40 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-1 bg-white/40 rounded"></div>
                        <div className="h-1 bg-white/40 rounded w-5/6"></div>
                        <div className="h-1 bg-white/40 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Use Section */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-black mb-16">Why Use Press Pass?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[{
                icon: <Users className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "Stay Connected",
                subtitle: "to your Community",
                description: "Follow news that matters from community papers, regional newsletters, and grassroots outlets."
              }, {
                icon: <Megaphone className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "One Platform.",
                subtitle: "Hundreds of Voices.",
                description: "Discover diverse perspectives from trusted local sources — all in one app."
              }, {
                icon: <MessageSquare className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "Support Independent",
                subtitle: "Journalism",
                description: "Your views and subscriptions empower community journalists across South Africa."
              }].map((item, idx) => (
                <div key={idx} className="border-2 border-[#ffbd59] bg-white">
                  <div className="p-8 text-center">
                    {item.icon}
                    <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                    <h4 className="text-lg font-semibold text-black mb-4">{item.subtitle}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-20 bg-[#e6e6e6]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-black mb-16">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[{
                icon: <User className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "Sign up for free.",
                description: "Create your profile in seconds."
              }, {
                icon: <BarChart3 className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "Choose your communities.",
                description: "Follow publications that matter to you."
              }, {
                icon: <Smartphone className="w-12 h-12 text-[#329ae1] mx-auto mb-4" />,
                title: "Get fresh local news.",
                description: "Curated, relevant, and reliable updates daily."
              }].map((item, idx) => (
                <div key={idx} className="border-2 border-[#ffbd59] bg-white">
                  <div className="p-8 text-center">
                    {item.icon}
                    <h3 className="text-xl font-bold text-black mb-4">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Publications */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-black mb-16">Featured publications</h2>
            <div className="flex justify-center items-center gap-12 flex-wrap">
              <div className="text-2xl font-serif text-[#329ae1] font-bold">The MERCURY</div>
              <div className="bg-[#329ae1] text-white px-4 py-2 font-bold">The Herald</div>
              <div className="text-2xl font-bold text-red-600">RISING SUN</div>
              <div className="text-2xl font-bold text-green-600 italic">isolezwe</div>           
            </div>
          </div>
        </section>

        {/* Download App CTA (Now at bottom) */}
        <section className="w-full py-10 bg-[#e6e6e6] text-center">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-black mb-4">Prefer mobile?</h3>
            <p className="text-gray-600 mb-6">Download the Press Pass app for a better on-the-go experience.</p>
            <button className="bg-[#329ae1] hover:bg-[#287dbf] text-white px-6 py-3 rounded-full">
              Download App
            </button>
          </div>
        </section>

        {/* Call to Action Section */}
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
    </div>
  );
}
