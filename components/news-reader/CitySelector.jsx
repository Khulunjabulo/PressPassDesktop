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
    <select
      value={selectedCity}
      onChange={handleChange}
      className="px-3 py-2 border rounded-lg bg-white"
    >
      <option value="">+ Add Location</option>
      {cities.map((city, index) => (
        <option key={index} value={city}>
          {city}
        </option>
      ))}
    </select>
  );
};

export default CitySelector;
