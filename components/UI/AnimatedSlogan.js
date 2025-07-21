'use client'

import React, { useState, useEffect } from 'react'

const slogans = ['APP.', 'PLACE.', 'PLATE.']

export default function AnimatedSlogan() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slogans.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-xl text-gray-600 mb-6 min-h-[2rem] transition-opacity duration-500 ease-in-out">
      <span className="text-black">YOUR COMMUNITY NEWS IN ONE </span>
      <span className="text-[#329ae1] font-bold">{slogans[index]}</span>
    </div>
  )
}
