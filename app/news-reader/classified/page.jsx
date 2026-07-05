"use client"

import { Button } from "@/components/UI/Button"
import { Input } from "@/components/UI/Input"
import Header from "@/components/news-reader/Header"
import MainHeader from "@/components/news-reader/NewsReaderMainHeader";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';
import { useEffect, useState, useMemo } from 'react';

// ─── Classified Item ───────────────────────────────────────────────────────────
function ClassifiedItem({ title, description, contact, price, imageUrl }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer">
      {imageUrl ? (
        <div className="w-full h-52 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-[#329ae1]/10 text-[#329ae1] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#329ae1]/20">
            Classified
          </span>
        </div>
        <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-[#329ae1] transition-colors duration-200 line-clamp-1">
          {title}
        </h4>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{contact}</span>
          </div>
          <span className="text-[#329ae1] font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Classified Section ────────────────────────────────────────────────────────
function ClassifiedSection({ title, items }) {
  return (
    <div className="space-y-5">
      {items.map((item, idx) => (
        <ClassifiedItem key={idx} {...item} />
      ))}
    </div>
  )
}

// ─── Publication ─────────────────────────────────────────────────────────────
function Publication({ name, sections }) {
  return (
    <div className="mb-16">
      <div className="text-center py-8">
        <h2
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: "serif" }}
        >
          {name}
        </h2>
        <div className="w-16 h-1 bg-[#329ae1] mx-auto mt-3 rounded-full"></div>
      </div>
      <div className="relative">
        {/* Desktop: 3 columns grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          {sections.flatMap(section => section.items).map((item, idx) => (
            <ClassifiedItem key={idx} {...item} />
          ))}
        </div>

        {/* Tablet and below: horizontal scroll */}
        <div className="lg:hidden flex overflow-x-auto space-x-5 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1">
          {sections.flatMap(section => section.items).map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-80">
              <ClassifiedItem {...item} />
            </div>
          ))}
        </div>

        {/* Scroll indicator for mobile/tablet */}
        <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 lg:hidden flex items-center bg-white border border-gray-100 p-2.5 rounded-full shadow-lg pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 animate-pulse">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Weather Forecast ──────────────────────────────────────────────────────────
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
        setLocation(data.name);
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
            fetchWeather();
          }
        );
      } else {
        console.warn("Geolocation is not supported by this browser. Falling back to default city.");
        setError("Geolocation not supported. Showing weather for default city.");
        fetchWeather();
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
      <div className="bg-gradient-to-br from-[#329ae1]/10 to-blue-50 border border-blue-100/50 rounded-2xl p-5 animate-pulse mt-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-200/50 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-blue-200/50 rounded-lg w-20"></div>
            <div className="h-4 bg-blue-200/50 rounded-lg w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center text-amber-800 text-sm mt-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <span className="font-semibold">Could not load local weather</span>
        </div>
        <p className="text-xs text-amber-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] text-white rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-[#329ae1]/20 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          {weatherIconUrl ? (
            <img src={weatherIconUrl} alt={weather.weather[0].description} className="w-12 h-12 drop-shadow-lg" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>
            </svg>
          )}
        </div>
        <div>
          <div className="font-bold text-3xl">{Math.round(weather.main.temp)}°C</div>
          <div className="text-sm text-white/90">
            {weather.weather[0].description} in <span className="font-bold">{location || weather.name}</span>
          </div>
        </div>
      </div>
      {weatherIconUrl && (
        <img src={weatherIconUrl} alt={weather.weather[0].description} className="w-16 h-16 drop-shadow-lg hidden sm:block" />
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ClassifiedsPage() {
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch classifieds from API
  useEffect(() => {
    const fetchClassifieds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/classifieds?publisherId=all');
        if (!response.ok) {
          throw new Error('Failed to fetch classifieds');
        }

        const data = await response.json();
        if (data.success) {
          const groupedByPublisher = {};

          const mockClassifieds = data.classifieds || [];

          mockClassifieds.forEach(classified => {
            const publisherId = classified.publisherId;
            if (!groupedByPublisher[publisherId]) {
              groupedByPublisher[publisherId] = {
                name: classified.publisherName || 'Unknown Publisher',
                classifieds: []
              };
            }
            groupedByPublisher[publisherId].classifieds.push(classified);
          });

          const publications = Object.values(groupedByPublisher).map(publisher => ({
            name: publisher.name,
            sections: [
              {
                title: "CLASSIFIEDS",
                items: publisher.classifieds.map(classified => ({
                  title: classified.title,
                  description: classified.description,
                  contact: `Contact: ${classified.publisherName}`,
                  price: `R${classified.price}`,
                  imageUrl: classified.imageUrl
                }))
              }
            ]
          }));

          setClassifieds(publications);
        } else {
          throw new Error(data.error || 'Failed to load classifieds');
        }
      } catch (err) {
        console.error('Error fetching classifieds:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassifieds();
  }, []);

  const filteredPublications = useMemo(() => {
    if (!searchQuery.trim()) {
      return classifieds;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return classifieds.map(pub => {
      const filteredSections = pub.sections.map(section => {
        const filteredItems = section.items.filter(item =>
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.description.toLowerCase().includes(lowercasedQuery)
        );

        if (filteredItems.length > 0 || section.title.toLowerCase().includes(lowercasedQuery)) {
          return { ...section, items: filteredItems.length > 0 ? filteredItems : section.items };
        }
        return null;
      }).filter(Boolean);

      if (filteredSections.length > 0) {
        return { ...pub, sections: filteredSections };
      }
      return null;
    }).filter(Boolean);

  }, [searchQuery, classifieds]);

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
    }, 1000);

    return () => clearInterval(timer);
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
    <div className="min-h-screen bg-gray-50/60">
      {isMobile ? <MainHeader /> : <Header />}

      <div className={`min-h-screen bg-gray-50/60 ${isMobile ? 'pt-16 sm:pt-20' : ''}`}>
        {/* Hero / Search Section */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Title Block */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-[#329ae1]/10 to-blue-50 border border-blue-100/50 rounded-2xl px-8 py-6 shadow-sm">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2" style={{ fontFamily: "serif" }}>
                  CLASSIFIEDS
                </h1>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Find what you're looking for or sell what you don't need
                </p>
              </div>
            </div>

            {/* Weather Forecast */}
            <WeatherForecast />

            {/* Search Bar */}
            <div className="flex gap-3 mb-6 mt-6">
              <div className="flex-1 relative group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#329ae1]">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                <Input
                  placeholder="Search by publication, category, or title..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-300 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-[#329ae1] hover:bg-[#2580c0] text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 shadow-sm">
                Search
              </Button>
            </div>

            {/* Date / Time */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-center shadow-sm">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{formattedDate}</div>
                <div className="font-bold text-xl text-gray-900 tabular-nums">{formattedTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classifieds Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8 pb-16">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-3 border-gray-200 border-t-[#329ae1] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading classifieds...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Classifieds</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filteredPublications.length > 0 ? (
            filteredPublications.map((pub, idx) => (
              <Publication key={idx} {...pub} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Classifieds Found</h3>
              <p className="text-gray-500">No classifieds are available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}