"use client";

import { useState, useEffect } from "react";

export default function usePrintMediaLogic() {
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user on component mount
  useEffect(() => {
    ("🔧 usePrintMediaLogic: Initializing...");
    
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('currentUser');
        ("👤 Raw user data from localStorage:", userData);
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          ("👤 Parsed user data:", {
            uid: parsedUser.uid,
            email: parsedUser.email,
            companyName: parsedUser.companyName,
            role: parsedUser.role
          });
          setCurrentUser(parsedUser);
        } else {
          console.warn("⚠️ No user data found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      }
    }
  }, []);

  // Create auth token for API calls
  const getAuthToken = () => {
    if (!currentUser) {
      console.error("❌ No current user for auth token");
      return null;
    }
    
    // Generate auth token (in production, use proper JWT)
    const token = currentUser.uid || `mock_token_${Date.now()}`;
    ("🔑 Generated auth token preview:", token.substring(0, 20) + "...");
    return token;
  };

  // Convert form data to FormData for API submission
  const createFormData = (formDataObj) => {
    ("📦 Creating FormData from object:", {
      title: formDataObj.title,
      author: formDataObj.author,
      category: formDataObj.category,
      hasImage: !!formDataObj.featuredImage,
      contentLength: formDataObj.content?.length || 0,
      publisherId: currentUser?.uid
    });

    const formData = new FormData();

    // Add all text fields
    Object.keys(formDataObj).forEach(key => {
      if (key === 'featuredImage' && formDataObj[key]) {
        ("🖼️ Adding featured image to FormData:", {
          name: formDataObj[key].name,
          size: formDataObj[key].size,
          type: formDataObj[key].type
        });
        formData.append(key, formDataObj[key]);
      } else if (key !== 'featuredImage') {
        formData.append(key, formDataObj[key]);
      }
    });

    // Add publisher information
    if (currentUser) {
      formData.append('publisherId', currentUser.uid);
      ("👤 Added publisher ID to FormData:", currentUser.uid);
      
      if (currentUser.companyName) {
        formData.append('publisherName', currentUser.companyName);
        ("👤 Added publisher name to FormData:", currentUser.companyName);
      }
    }

    // Log all FormData keys for debugging
    ("📦 FormData keys:", [...formData.keys()]);
    
    return formData;
  };

  const handleFormSubmit = async (formDataObj) => {
    ("🚀 Form submission started");
    ("📝 Form data received:", {
      title: formDataObj.title,
      author: formDataObj.author,
      category: formDataObj.category,
      isDraft: formDataObj.isDraft,
      publishNow: formDataObj.publishNow,
      currentUser: currentUser ? { uid: currentUser.uid, companyName: currentUser.companyName } : null
    });

    // Check authentication
    if (!currentUser) {
      console.error("❌ No authenticated user");
      setSubmissionStatus({
        type: "error",
        message: "Please sign in to publish articles.",
      });
      return;
    }

    try {
      // Get auth token
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Failed to generate authentication token");
      }

      // Convert to FormData for proper file upload handling
      const formData = createFormData(formDataObj);

      // Prepare request headers
      const headers = {
        'Authorization': `Bearer ${authToken}`
      };

      // Create request URL with publisher ID
      const url = `/api/publish-article?publisherId=${encodeURIComponent(currentUser.uid)}`;
      
      ("📡 Making request to:", url);
      ("📡 Request headers:", headers);
      ("📡 Publisher ID:", currentUser.uid);

      // Make API call to the correct endpoint
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData
      });

      ("📡 Response status:", response.status);
      ("📡 Response ok:", response.ok);

      const result = await response.json();
      ("📡 Response data:", result);

      if (response.ok) {
        ("✅ Article submission successful:", result);
        setSubmissionStatus({
          type: "success",
          message: result.message || "Article submitted successfully!",
          articleId: result.articleId
        });

        // Log success details
        ("✅ Article created:", {
          id: result.articleId,
          title: result.article?.title,
          status: result.article?.status,
          publisherId: result.article?.publisherId
        });
      } else {
        console.error("❌ API request failed:", result);
        throw new Error(result.error || "Failed to submit article");
      }

      // Clear status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);

    } catch (error) {
      console.error("💥 Error submitting form:", error);
      console.error("💥 Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setSubmissionStatus({
        type: "error",
        message: error.message || "Failed to submit article. Please try again.",
      });

      // Clear error status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    ("🧪 Testing Firebase connection...");
    
    if (!currentUser) {
      console.error("❌ No user for Firebase test");
      return;
    }

    try {
      const response = await fetch(`/api/test-firebase?publisherId=${currentUser.uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      ("🧪 Firebase test result:", result);
      
      return result;
    } catch (error) {
      console.error("❌ Firebase test failed:", error);
      return { success: false, error: error.message };
    }
  };

  return { 
    submissionStatus, 
    handleFormSubmit, 
    currentUser,
    testFirebaseConnection
  };
}

// Subscribers Logic (unchanged)
export const subscriberData = [
  { month: "Jan", subscribers: 32000 },
  { month: "Feb", subscribers: 34500 },
  { month: "Mar", subscribers: 36800 },
  { month: "Apr", subscribers: 38200 },
  { month: "May", subscribers: 40100 },
  { month: "Jun", subscribers: 42300 },
  { month: "Jul", subscribers: 44170 },
];

export const subscriberTypes = [
  { type: "Premium", count: 18250, percentage: 41.3, color: "#8884d8" },
  { type: "Standard", count: 15920, percentage: 36.0, color: "#82ca9d" },
  { type: "Basic", count: 10000, percentage: 22.7, color: "#ffc658" },
];