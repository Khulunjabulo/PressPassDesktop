"use client";
import { Users, Megaphone, MessageSquare, User, BarChart3, Smartphone, Menu, UserPlus, LogIn, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnimatedSlogan from "@/components/news-reader/AnimatedSlogan";
import MainHeader from "@/components/news-reader/NewsReaderMainHeader";
import "../app/globals.css"
import React, { useState, useEffect } from "react";
import useLandingPageLogic from "@/hooks/LandingPageLogic";

export default function NewsReaderHomePage() {
  const { handleStartReading } = useLandingPageLogic();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Featured Publishers State
  const [publishers, setPublishers] = useState([]);
  const [loadingPublishers, setLoadingPublishers] = useState(true);
  const [currentPublisherIndex, setCurrentPublisherIndex] = useState(0);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch publishers
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        setLoadingPublishers(true);
        const response = await fetch('/api/news-sources');
        const data = await response.json();
        
        if (data.success && data.newsources) {
          setPublishers(data.newsources);
        }
      } catch (error) {
        console.error('Error fetching publishers:', error);
      } finally {
        setLoadingPublishers(false);
      }
    };

    fetchPublishers();
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-scroll publishers carousel
  useEffect(() => {
    if (publishers.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentPublisherIndex(prev => (prev + 1) % publishers.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [publishers.length]);

  // Publisher carousel navigation
  const nextPublisher = () => {
    setCurrentPublisherIndex((prev) => (prev + 1) % publishers.length);
  };

  const prevPublisher = () => {
    setCurrentPublisherIndex((prev) => (prev - 1 + publishers.length) % publishers.length);
  };

  // Get visible publishers
  const getVisiblePublishers = () => {
    if (publishers.length === 0) return [];
    
    const visible = [];
    for (let i = 0; i < Math.min(4, publishers.length); i++) {
      const index = (currentPublisherIndex + i) % publishers.length;
      visible.push(publishers[index]);
    }
    return visible;
  };

  // Get visible reviews
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : index < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div>
      {/* Mobile Landing Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#329ae1] px-3 sm:px-6 py-2 sm:py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-12">
          <Link href="/" className="flex-shrink-0">
            <Image src="/Presspass.png" alt="Press Pass logo" width={80} height={32} className="w-[80px] h-auto" priority />
          </Link>
          <div className="relative">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
              <Menu size={24} />
            </button>
            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link href="/signup">
                    <div className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </div>
                  </Link>
                  <Link href="/signin">
                    <div className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <MainHeader/>
      </div>

      <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden pt-14 sm:pt-20 md:pt-24 lg:pt-28">
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
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">{publishers.length}+</div>
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
            
            {loadingPublishers ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#329ae1]"></div>
              </div>
            ) : publishers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No publishers available yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Carousel Container */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                  {/* Previous Button */}
                  {publishers.length > 4 && (
                    <button
                      onClick={prevPublisher}
                      className="flex-shrink-0 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                      aria-label="Previous publisher"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#329ae1]" />
                    </button>
                  )}

                  {/* Publishers Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 max-w-4xl">
                    {getVisiblePublishers().map((publisher, index) => (
                      <div
                        key={`${publisher.id}-${index}`}
                        className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="text-center">
                          {publisher.logo ? (
                            <img
                              src={publisher.logo}
                              alt={publisher.name}
                              className="max-h-16 max-w-full object-contain mx-auto"
                            />
                          ) : (
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#329ae1]">
                              {publisher.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Button */}
                  {publishers.length > 4 && (
                    <button
                      onClick={nextPublisher}
                      className="flex-shrink-0 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                      aria-label="Next publisher"
                    >
                      <ChevronRight className="w-6 h-6 text-[#329ae1]" />
                    </button>
                  )}
                </div>

                {/* Dots Indicator */}
                {publishers.length > 4 && (
                  <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: publishers.length }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPublisherIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentPublisherIndex
                            ? 'bg-[#329ae1] w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* User Reviews Section */}
        <section className="w-full py-10 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4">What Our Users Say</h2>
              
              {/* Overall Rating */}
              {totalReviews > 0 && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(averageRating)}
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {averageRating} out of 5
                  </div>
                  <div className="text-sm text-gray-600">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </div>
                </div>
              )}
            </div>

            {loadingReviews ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#329ae1]"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No reviews yet. Be the first to share your experience!</p>
                <Link href="/signin" className="text-[#329ae1] hover:underline font-medium">
                  Sign in to leave a review
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {visibleReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {review.userProfilePicture ? (
                            <img
                              src={review.userProfilePicture}
                              alt={review.userName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#329ae1] flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {review.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">
                            {review.reviewText}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* See All Reviews Button */}
                {reviews.length > 4 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-6 py-3 bg-[#329ae1] text-white rounded-full hover:bg-[#287dbf] transition-colors font-medium"
                    >
                      {showAllReviews ? 'Show Less' : `See All ${reviews.length} Reviews`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

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