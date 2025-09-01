"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Plus, X } from "lucide-react";
import { useNewsSources } from "@/hooks/useNewsSources";

const CitySelector = ({ onCityChange }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { newsources, loading, error } = useNewsSources();

  // Fetch unique cities from Firestore publishers collection
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const snapshot = await getDocs(collection(db, "publishers"));
        const cityList = snapshot.docs
          .map((doc) => doc.data().city)
          .filter(Boolean)
          .map((c) => c.trim());
        setCities([...new Set(cityList)]);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    onCityChange(city);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Add Location Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-[#329ae1] text-white rounded-lg shadow hover:bg-[#1070b0]"
      >
        <Plus className="w-5 h-5 mr-2" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Select Your City
            </h2>

            <select
              value={selectedCity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose City --</option>
              {cities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {selectedCity && (
              <p className="mt-4 text-sm text-gray-600">
                ✅ You selected:{" "}
                <span className="font-medium">{selectedCity}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Removed the filtered publisher cards completely */}
    </div>
  );
};

export default CitySelector;
