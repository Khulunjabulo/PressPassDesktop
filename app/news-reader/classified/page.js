"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Classified Item Component
function ClassifiedItem({ title, description, contact, price }) {
  return (
    <div className="border-b pb-3 last:border-b-0 last:pb-0">
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">{contact}</span>
        <span className="text-red-500 font-bold">{price}</span>
      </div>
    </div>
  )
}

// Classified Section Component (Real Estate, Vehicles, Jobs)
function ClassifiedSection({ title, items }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="bg-blue-500 text-white text-center py-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {items.map((item, idx) => (
          <ClassifiedItem key={idx} {...item} />
        ))}
      </div>
    </div>
  )
}

// Publication Component
function Publication({ name, sections }) {
  return (
    <div className="mb-12">
      <div className="text-center py-6">
        <h2
          className="text-4xl font-bold text-green-600"
          style={{ fontFamily: "serif" }}
        >
          {name}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <ClassifiedSection key={idx} {...section} />
        ))}
      </div>
    </div>
  )
}

export default function ClassifiedsPage() {
  // Publication Data
  const publications = [
    {
      name: "IsolezWe",
      sections: [
        {
          title: "REAL ESTATE",
          items: [
            {
              title: "3BR House - Downtown",
              description: "Spacious family home with garden, near schools and shopping centers.",
              contact: "Contact: 555-0123",
              price: "R450,000",
            },
            {
              title: "2BR Apartment - City Center",
              description: "Modern apartment with balcony, fully furnished, available immediately.",
              contact: "Contact: 555-0456",
              price: "R1,200/month",
            },
            {
              title: "Office Space for Rent",
              description: "Prime location, 500 sq ft, parking included.",
              contact: "Contact: 555-0789",
              price: "R800/month",
            },
          ],
        },
        {
          title: "VEHICLES",
          items: [
            {
              title: "2018 Honda Civic",
              description: "Excellent condition, low mileage, one owner, full service history.",
              contact: "Contact: 555-1234",
              price: "R18,500",
            },
            {
              title: "2020 Ford F-150",
              description: "Pickup truck, 4WD, excellent for work or family adventures.",
              contact: "Contact: 555-5678",
              price: "R32,000",
            },
            {
              title: "Mountain Bike",
              description: "Trek mountain bike, rarely used, perfect for trails.",
              contact: "Contact: 555-9012",
              price: "R500",
            },
          ],
        },
        {
          title: "JOBS",
          items: [
            {
              title: "Marketing Manager",
              description: "Full-time position, 3+ years experience required, marketing degree.",
              contact: "Contact: hr@company.com",
              price: "R65,000/year",
            },
            {
              title: "Part-time Cashier",
              description: "Retail store, great for students, retail experience preferred.",
              contact: "Contact: 555-3456",
              price: "R1500/hour",
            },
            {
              title: "Freelance Writer",
              description: "Content writer for various clients, remote work available.",
              contact: "Contact: writer@media.com",
              price: "R2500/article",
            },
          ],
        },
      ],
    },
    {
      name: "The Citizen",
      sections: [
        {
          title: "REAL ESTATE",
          items: [
            {
              title: "Townhouse in Suburbs",
              description: "Secure complex, 2 bedrooms, pool access.",
              contact: "Contact: 555-2222",
              price: "R850,000",
            },
          ],
        },
        {
          title: "VEHICLES",
          items: [
            {
              title: "Toyota Corolla 2017",
              description: "Well maintained, fuel efficient.",
              contact: "Contact: 555-3333",
              price: "R150,000",
            },
          ],
        },
        {
          title: "JOBS",
          items: [
            {
              title: "Graphic Designer",
              description: "Creative agency, portfolio required.",
              contact: "Contact: design@citizen.com",
              price: "R25,000/month",
            },
          ],
        },
      ],
    },
    {
      name: "PJ Thermal",
      sections: [
        {
          title: "REAL ESTATE",
          items: [
            {
              title: "Warehouse for Rent",
              description: "Industrial park, 2000 sq ft, loading dock.",
              contact: "Contact: 555-4444",
              price: "R12,000/month",
            },
          ],
        },
        {
          title: "VEHICLES",
          items: [
            {
              title: "Isuzu Truck",
              description: "Perfect for logistics, durable and reliable.",
              contact: "Contact: 555-5555",
              price: "R350,000",
            },
          ],
        },
        {
          title: "JOBS",
          items: [
            {
              title: "Boilermaker",
              description: "Experienced artisan required, full-time.",
              contact: "Contact: jobs@pjthermal.com",
              price: "R30,000/month",
            },
          ],
        },
      ],
    },
    {
      name: "Thabang",
      sections: [
        {
          title: "REAL ESTATE",
          items: [
            {
              title: "Farm for Sale",
              description: "50 hectares with water rights.",
              contact: "Contact: 555-6666",
              price: "R2,500,000",
            },
          ],
        },
        {
          title: "VEHICLES",
          items: [
            {
              title: "Tractor Massey Ferguson",
              description: "Good condition, recently serviced.",
              contact: "Contact: 555-7777",
              price: "R200,000",
            },
          ],
        },
        {
          title: "JOBS",
          items: [
            {
              title: "Farmhand",
              description: "Full-time, experience with livestock preferred.",
              contact: "Contact: thabang@farm.com",
              price: "R12,000/month",
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="border-2 border-blue-400 border-dashed p-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">CLASSIFIEDS</h1>
              <p className="text-sm text-gray-500">
                Find what you're looking for or sell what you don't need
              </p>
            </div>
            <p className="text-blue-500 text-sm">📍 Rustenburg, NW</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Input placeholder="Search classified ads..." className="flex-1" />
            <Button className="bg-red-500 hover:bg-red-600 text-white px-6">
              SEARCH
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-center">
              <div className="text-xs">Today</div>
              <div className="font-semibold">Tuesday, July 8</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {publications.map((pub, idx) => (
          <Publication key={idx} {...pub} />
        ))}
      </div>
    </div>
  )
}
