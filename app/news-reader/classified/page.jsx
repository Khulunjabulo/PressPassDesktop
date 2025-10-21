"use client"

import { Button } from "@/components/UI/Button"
import { Input } from "@/components/UI/Input"
import Header from "@/components/news-reader/Header"
import MainHeader from "@/components/news-reader/NewsReaderMainHeader";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';
import { useEffect, useState, useMemo } from 'react';

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
      <div className="relative">
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {sections.map((section, idx) => (
            <div key={idx} className="flex-shrink-0 w-11/12 sm:w-1/2 md:w-[32%]">
              <ClassifiedSection {...section} />
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden md:flex items-center bg-gray-100 p-2 rounded-full shadow-md pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-600 animate-pulse"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  )
}

// Weather Forecast Component
function WeatherForecast() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const API_KEY = '5e41f9571f08b9aa7bc528dd0ab76c54'; 
  const DEFAULT_CITY = 'Johannesburg';

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      setLoading(true);
      setError(null);
      try {

        const url = lat && lon 
          ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          : `https://api.openweathermap.org/data/2.5/weather?q=${DEFAULT_CITY}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Weather data not available');
        }
        const data = await response.json();
        setWeather(data);
        setLocation(data.name); // Set location name from API response
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch weather:", err);
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (geoError) => {
            console.warn("Geolocation error:", geoError.message, "Falling back to default city.");
            setError(`Location access denied. Showing weather for ${DEFAULT_CITY}.`);
            fetchWeather(); // Fetch for default city
          }
        );
      } else {
        console.warn("Geolocation is not supported by this browser. Falling back to default city.");
        setError("Geolocation not supported. Showing weather for default city.");
        fetchWeather(); // Fetch for default city
      }
    };

    getLocation();
  }, []);

  const weatherIconUrl = useMemo(() => {
    if (weather?.weather?.[0]?.icon) {
      return `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    }
    return null;
  }, [weather]);

  if (loading) {
    return (
      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 text-center animate-pulse mt-4">
        <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto"></div>
        <div className="h-8 bg-blue-200 rounded w-1/2 mx-auto mt-2"></div>
      </div>
    );
  }

  if (error || !weather) {
    // Display a more user-friendly error message
    return (
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-center text-yellow-800 text-sm mt-4">
        <p className="font-semibold">Could not load local weather.</p>
        {/* The error state now contains a user-friendly message */}
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#329ae1] text-white rounded-lg p-4 flex items-center justify-between mt-4 shadow-md">
      <div className="text-center">
        <div className="font-bold text-4xl">{Math.round(weather.main.temp)}°C</div>
        <div className="text-sm capitalize">
          {weather.weather[0].description} in <span className="font-bold">{location || weather.name}</span>
        </div>
      </div>
      {weatherIconUrl && <img src={weatherIconUrl} alt={weather.weather[0].description} className="w-16 h-16" />}
    </div>
  );
}

export default function ClassifiedsPage() {
  // Publication Data
  const publications = [
    {
          name: <div className="flex justify-center items-center">
  <img src="/isolezwe.png" alt="Isolezwe" className="h-6 w-auto" />
</div>,
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
      name: <div className="flex justify-center items-center">
  <img src="/The Citizen.png" alt="The Citizen" className="h-40 w-60" />
</div>,
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
      name: <div className="flex justify-center items-center">
  <img src="/The Mercury.png" alt="The Mercury" className="h-40 w-60 " />
</div>,
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
      name: <div className="flex justify-center items-center ">
  <img src="/Herald.png" alt="Herald" className="h-40 w-60 " />
</div>,
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

  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPublications = useMemo(() => {
    if (!searchQuery.trim()) {
      return publications;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return publications.map(pub => {
      // For each publication, filter its sections based on the search query.
      const filteredSections = pub.sections.map(section => {
        // An item matches if its title or description includes the query.
        const filteredItems = section.items.filter(item =>
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.description.toLowerCase().includes(lowercasedQuery)
        );

        // A section is kept if its title matches, or if it contains matching items.
        if (filteredItems.length > 0 || section.title.toLowerCase().includes(lowercasedQuery)) {
          // If the section title matches but no items do, show all original items in that section.
          // Otherwise, show only the filtered items.
          return { ...section, items: filteredItems.length > 0 ? filteredItems : section.items };
        }
        return null;
      }).filter(Boolean); // Remove any sections that didn't match.

      // Only include the publication in the final results if it has any matching sections.
      if (filteredSections.length > 0) {
        return { ...pub, sections: filteredSections };
      }
      return null;
    }).filter(Boolean); // Remove any publications that have no matching content.

  }, [searchQuery, publications]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div>
    {isMobile ? <MainHeader /> : <Header />}
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pt-16 sm:pt-20' : ''}`}>
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="border-2 border-blue-400 border-dashed p-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">CLASSIFIEDS</h1>
              <p className="text-sm text-gray-500">
                Find what you're looking for or sell what you don't need
              </p>
            </div>
          </div>

          {/* Weather Forecast */}
          <WeatherForecast />

          <div className="flex gap-2 mb-4 mt-5" >
            <Input 
              placeholder="Search by publication, category, or title..." 
              className="flex-1" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />
            <Button className="bg-red-500 hover:bg-red-600 text-white px-6">
              SEARCH
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-center">
              <div className="text-xs">{formattedDate}</div>
              <div className="font-semibold text-lg">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub, idx) => (
            <Publication key={idx} {...pub} />
          ))
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
