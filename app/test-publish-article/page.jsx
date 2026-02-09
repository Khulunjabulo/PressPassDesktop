"use client";

import { useState } from "react";

export default function TestPublishArticle() {
  const [response, setResponse] = useState(null);

  const handleTest = async () => {
    ("🚀 Sending test request to /api/publish-article");

    try {
      const formData = new FormData();
      formData.append("title", "Test Article from Endpoint Tester");
      formData.append("subtitle", "Subtitle for Testing");
      formData.append("author", "John Doe");
      formData.append("authorTitle", "Reporter");
      formData.append("category", "News");
      formData.append("tags", "test,endpoint,article");
      formData.append("style", "standard");
      formData.append("content", "<p>This is a test article content.</p>");
      formData.append("metaDescription", "Test description");
      formData.append("publishNow", "true");
      formData.append("allowComments", "true");
      formData.append("sendNewsletter", "false");
      formData.append("isDraft", "false");
      formData.append("wordCount", "50");
      formData.append("readingTime", "1");

      // Fake image for upload
      const blob = new Blob(["dummy image content"], { type: "image/png" });
      formData.append("featuredImage", blob, "test-image.png");

      const res = await fetch("/api/publish-article", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token-123", // ✅ required for mock auth
        },
        body: formData,
      });

      const data = await res.json();
      ("📡 API Response:", data);
      setResponse(data);
    } catch (error) {
      console.error("❌ Test request failed:", error);
      setResponse({ error: error.message });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🧪 Publish Article Endpoint Tester</h1>
      <button
        onClick={handleTest}
        style={{ padding: "10px 20px", background: "green", color: "#fff" }}
      >
        Test Publish Article Endpoint
      </button>

      {response && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 20 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
