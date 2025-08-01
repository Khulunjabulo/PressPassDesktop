"use client";

//Publisher Logic
import { useState } from "react";

export default function usePrintMediaLogic() {
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleFormSubmit = async (formData) => {
    try {
      console.log("Form submitted with data:", formData);

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus({
          type: "success",
          message: result.message || "Article submitted successfully!",
        });
      } else {
        throw new Error(result.error || "Failed to submit article");
      }

      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionStatus({
        type: "error",
        message:
          error.message || "Failed to submit article. Please try again.",
      });

      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);
    }
  };

  return { submissionStatus, handleFormSubmit };
}


//Subscribers Logic

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
