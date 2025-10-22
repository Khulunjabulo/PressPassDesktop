"use client";

import { useState, useEffect } from "react";
import Header from "@/components/UI/header";
import PublisherSidebar from "@/components/UI/publisherSidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { subscriberTypes } from "@/hooks/PrintMediaLogic";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

export default function Subscribers() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);

  // Initialize currentUser from localStorage (same as dashboard)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Current user loaded:', { 
          uid: user.uid, 
          role: user.role,
          companyName: user.companyName
        });
        setCurrentUser(user);
      } else {
        console.log('⚠️ No user data found in localStorage');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error reading user data:', error);
      setCurrentUser(null);
    }
  }, []);

  // Fetch subscriber count using currentUser.uid (same as dashboard)
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (!currentUser?.uid) {
        setFetchingData(false);
        return;
      }
      
      try {
        setFetchingData(true);
        setError(null);
        
        console.log('📊 Fetching subscriber count for publisher:', currentUser.uid);
        
        const response = await fetch(`/api/subscribers?publisherId=${currentUser.uid}`);
        const data = await response.json();
        
        console.log('📥 Subscriber API response:', data);
        
        if (data.success) {
          setSubscriberCount(data.subscriberCount || 0);
          console.log('✅ Subscriber count set to:', data.subscriberCount);
        } else {
          // If publisher not found, show 0 instead of error
          if (data.error === "Publisher not found") {
            console.log("Publisher document not found, showing 0 subscribers");
            setSubscriberCount(0);
          } else {
            setError(data.error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching subscriber count:', error);
        setError("Failed to load subscriber data");
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchSubscriberCount();
  }, [currentUser?.uid]);

  const isLoading = loading || fetchingData;

  // Debug log to see what we have
  useEffect(() => {
    console.log('🔍 Subscribers Page State:', {
      currentUser: currentUser?.uid,
      publisher: publisher?.id,
      subscriberCount,
      isLoading,
      error
    });
  }, [currentUser, publisher, subscriberCount, isLoading, error]);

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <PublisherSidebar />
        <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Subscribers
            </h1>
            <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm w-full sm:w-auto">
              Export Data
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full min-w-0">
              <h2 className="text-sm font-medium text-gray-500">
                Total Subscribers
              </h2>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">
                    {subscriberCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Readers who favorited you
                  </p>
                </>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full min-w-0 opacity-50">
              <h2 className="text-sm font-medium text-gray-500">
                New Subscribers (This Month)
              </h2>
              <p className="text-2xl sm:text-3xl font-bold mt-2">
                Coming Soon
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Historical data tracking in development
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full min-w-0 opacity-50">
              <h2 className="text-sm font-medium text-gray-500">Churn Rate</h2>
              <p className="text-2xl sm:text-3xl font-bold mt-2">
                Coming Soon
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Analytics feature in development
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full min-w-0 opacity-50">
              <h2 className="text-base sm:text-lg font-semibold mb-4">
                Subscriber Growth
              </h2>
              <div className="h-56 sm:h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Coming Soon</p>
                  <p className="text-sm mt-2">
                    Historical growth tracking in development
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full min-w-0">
              <h2 className="text-base sm:text-lg font-semibold mb-4">
                Subscriber Types
              </h2>
              <ul className="space-y-4">
                {subscriberTypes.map((item, index) => (
                  <li key={index} className="border-b pb-3">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{item.type}</h3>
                        <p className="text-sm text-gray-500">
                          {item.count.toLocaleString()} subscribers
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full xs:w-auto">
                        <div className="w-full xs:w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">
                  Subscriber Acquisition
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Direct</p>
                    <p className="font-medium">62%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Referral</p>
                    <p className="font-medium">24%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Social</p>
                    <p className="font-medium">10%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Other</p>
                    <p className="font-medium">4%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}