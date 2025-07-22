"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Input from "@/components/UI/Input";
import { PublicationCard } from "@/components/UI/PublicationCard";
import { useDebounce } from "@/hooks/useDebounce";
import NewsReaderHeader from "@/components/UI/NewsReaderHeader";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      if (!debouncedSearchTerm) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/news?query=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPublications(data.articles || []);
      } catch (error) {
        console.error("Failed to fetch publications:", error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [debouncedSearchTerm]);

  return (
    <div>
      <NewsReaderHeader />
      <div className="min-h-screen bg-gray-100">
        <div className="flex flex-col md:flex-row p-4 gap-4 max-w-7xl mx-auto pt-20">
          {/* Main Content Area */}
          <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
            {/* Search Bar */}
            <div className="relative flex items-center mb-6">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for Publication"
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 text-gray-500 hover:bg-transparent"
              >
                <span className="text-2xl font-bold">{"+"}</span>
              </button>
            </div>

            {/* Main Ad Banner */}
            <div className="bg-sky-500 text-white text-center py-12 rounded-md mb-6">
              <h2 className="text-3xl font-bold">Ads here</h2>
            </div>

            {/* Publication Grid */}
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">
              Tap on publication to subscribe
            </h3>
            {loading ? (
              <div className="text-center text-gray-500">Loading publications...</div>
            ) : publications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publications.map((pub, index) => (
                  <PublicationCard
                    key={index}
                    logoText={pub.source.name || "News"}
                    logoBgColor="#4F46E5"
                    publicationName={pub.title}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No publications found. Try a different search term.
              </div>
            )}
          </main>

          {/* Right Sidebar Ads */}
          <aside className="w-full md:w-64 flex flex-col gap-4">
            <div className="bg-gray-200 text-gray-700 text-center py-20 rounded-lg shadow-md flex items-center justify-center">
              <h3 className="text-xl font-semibold">Ads here</h3>
            </div>
            <div className="bg-gray-200 text-gray-700 text-center py-20 rounded-lg shadow-md flex items-center justify-center">
              <h3 className="text-xl font-semibold">Ads here</h3>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
