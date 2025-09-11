"use client";

import useUserReviews, { userReviews } from "@/components/user review/UserReviewData";
import { Star } from "lucide-react";

function Stars({ count }) {
  return (
    <div className="flex items-center mb-3" aria-label={`${count} star rating`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={20}
          className={i < count ? "text-[#ffbd59]" : "text-gray-300"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function UserReviewsSection() {
  const reviews = userReviews; 
  return (
    <section className="w-full py-10 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
          {reviews.map((r, idx) => (
          <article
            key={idx}
            className="border-2 border-[#ffbd59] bg-white p-3 sm:p-6 lg:p-8 rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2 sm:mb-3" aria-label={`${r.rating} star rating`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`sm:w-5 sm:h-5 ${i < r.rating ? "text-[#ffbd59]" : "text-gray-300"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2 leading-tight">{r.title}</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-6 leading-relaxed">"{r.body}"</p>
            <p className="text-xs sm:text-sm font-semibold text-black">
              — {r.name}, {r.location}
            </p>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}
