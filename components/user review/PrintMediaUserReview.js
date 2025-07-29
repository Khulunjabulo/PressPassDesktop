import React from "react";
import PrintMediaUserReviewData from "./PrintMediaUserReviewData";

function StarRating({ stars }) {
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 !== 0;
  const emptyStars = 5 - Math.ceil(stars);

  return (
    <div className="flex space-x-1 text-yellow-500 text-lg">
      {Array(fullStars).fill().map((_, i) => (
        <span key={`full-${i}`}>★</span>
      ))}
      {hasHalf && <span key="half">★</span>}
      {Array(emptyStars).fill().map((_, i) => (
        <span key={`empty-${i}`}>☆</span>
      ))}
    </div>
  );
}

export default function PrintMediaUserReviewCard() {
  return (
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 p-6">
  {PrintMediaUserReviewData.map((item, index) => (
    <div
      key={index}
      className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-l-4"
      style={{ borderLeftColor: '#FFD700' }} 
    >
      <div className="text-3xl mb-2">{item.logo}</div>
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <StarRating stars={item.stars} />
      <p className="text-gray-700 italic mt-2">{item.headline}</p>
      <p className="text-sm text-gray-600 mt-3">{item.quote}</p>
    </div>
  ))}
</div>

  );
}
