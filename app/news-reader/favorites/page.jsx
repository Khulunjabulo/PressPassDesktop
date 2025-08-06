'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Cards';
import { 
  Home, Search, Heart, Tag, ChevronRight, User, Plus, 
  Linkedin, Youtube, Facebook, Volume2 
} from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/Firebase/firebase';
import AdSlot from '@/components/news-reader/AdsSlot'; // ✅ Import dynamic AdSlot component

const auth = getAuth(app);

export default function FavoritesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [favoriteStats, setFavoriteStats] = useState({
    all: 0,
    magazines: 0,
    newspapers: 0
  });

  // ✅ Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.uid) {
          setCurrentUser(userData);
          fetchFavorites(userData.uid);
        } else {
          router.push('/signin');
        }
      } else {
        router.push('/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch favorites
  const fetchFavorites = async (userId) => {
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites);
        calculateStats(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // ✅ Calculate stats
  const calculateStats = (favs) => {
    const stats = {
      all: favs.length,
      magazines: favs.filter(fav => fav.type === 'magazine').length,
      newspapers: favs.filter(fav => fav.type === 'newspaper').length
    };
    setFavoriteStats(stats);
  };

  // ✅ Filter favorites
  const getFilteredFavorites = () => {
    if (activeTab === 'all') return favorites;
    return favorites.filter(fav => fav.type === activeTab.slice(0, -1));
  };

  // ✅ Group favorites by publication
  const getGroupedFavorites = () => {
    const filtered = getFilteredFavorites();
    if (activeTab === 'all') return filtered;

    const grouped = {};
    filtered.forEach(fav => {
      const pubName = fav.publicationName || fav.source || 'Unknown';
      if (!grouped[pubName]) {
        grouped[pubName] = {
          name: pubName,
          type: fav.type,
          stories: [],
          image: fav.publicationImage || null
        };
      }
      grouped[pubName].stories.push(fav);
    });
    return Object.values(grouped);
  };

  // ✅ Navigation handlers
  const handleAddMore = () => router.push('/news-reader');
  const handlePublicationClick = (publication) => {
    router.push(`/favorites/${encodeURIComponent(publication.name)}?type=${publication.type}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 p-4 border-r">
          <div className="space-y-4">
            {['Category', 'Language', 'Date'].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">{item}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">My Favorites</h2>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <button onClick={handleAddMore} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 md:space-x-8 mb-6 overflow-x-auto">
            {['all', 'magazines', 'newspapers'].map(tab => (
              <button 
                key={tab}
                className={`pb-2 whitespace-nowrap ${activeTab === tab ? 'text-black font-medium border-b-2 border-black' : 'text-gray-500'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({favoriteStats[tab]})
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {getGroupedFavorites().length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-4">Start adding your favorite stories and publications</p>
                <button 
                  onClick={handleAddMore}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Stories
                </button>
              </div>
            ) : (
              getGroupedFavorites().map((item, index) => (
                <div key={index} className="text-center">
                  <Card className="mb-2 cursor-pointer hover:shadow-lg transition-shadow" 
                        onClick={() => activeTab !== 'all' ? handlePublicationClick(item) : null}>
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] flex items-center justify-center bg-gray-50 border-2 border-gray-200">
                        {activeTab === 'all' ? (
                          item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-4">
                              <h3 className="font-medium text-sm mb-2">{item.title}</h3>
                              <p className="text-xs text-gray-500">{item.source}</p>
                            </div>
                          )
                        ) : (
                          item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <div className="font-bold text-lg mb-1">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.stories.length} stories</div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'all' ? (item.title || item.source) : `${item.name} (${item.stories.length})`}
                  </p>
                </div>
              ))
            )}
          </div>
        </main>

        {/* ✅ Right Sidebar with Dynamic Ad */}
        <aside className="hidden lg:block w-80 p-4">
          <div className="space-y-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-bold text-sm mb-2">YOUR READING STATS</h3>
                  {['all', 'magazines', 'newspapers'].map(key => (
                    <div key={key} className="flex justify-between text-xs">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="font-bold">{favoriteStats[key]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ✅ Dynamic Advertisement */}
            <AdSlot 
  label="Sponsored Ad" 
  height={250} 
  width={300}
  preferredType="rectangles"
  className="max-w-[300px]"
/>

          </div>
        </aside>
      </div>
    </div>
  );
}
