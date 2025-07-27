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
    <section className="w-full py-20 bg-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          User Reviews – Newsreader
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          What our readers across South Africa are saying about Press Pass.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((r, idx) => (
          <article
            key={idx}
            className="border-2 border-[#ffbd59] bg-white p-8 rounded-md"
          >
            <Stars count={r.rating} />
            <h3 className="text-xl font-bold text-black mb-2">{r.title}</h3>
            <p className="text-gray-600 mb-6">“{r.body}”</p>
            <p className="text-sm font-semibold text-black">
              — {r.name}, {r.location}
            </p>
          </article>
          ))}
        </div>
      </div>
    </section>
  );
}
