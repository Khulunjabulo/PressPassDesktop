"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../Firebase/firebase"; 
import { collection, getDocs } from "firebase/firestore";

const CitySelector = ({ onCityChange }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const snapshot = await getDocs(collection(db, "publishers"));
        const cityList = snapshot.docs
          .map(doc => doc.data().city)
          .filter(Boolean); // remove null/undefined
        setCities([...new Set(cityList)]); // unique
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  const handleChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    onCityChange(city);
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
