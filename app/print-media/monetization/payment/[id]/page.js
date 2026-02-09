"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/UI/Button";

// Paystack script loader
const loadPaystackScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("paystack-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const { id } = useParams(); // template ID from URL
  const router = useRouter();

  const [template, setTemplate] = useState(null);

  // Mock templates (reuse same structure)
  const templates = [
    { id: 1, name: "Headline", price: 5000, dimension: "300w x 250h(px)" },
    { id: 2, name: "Feed", price: 3500, dimension: "250w x 250h(px)" },
    { id: 3, name: "Within Article", price: 4000, dimension: "300w x 250h(px)" },
    { id: 4, name: "Page Wrap 1", price: 2500, dimension: "200w x 200h(px)" },
    { id: 5, name: "Page Wrap 2", price: 2500, dimension: "200w x 200h(px)" },
  ];

  useEffect(() => {
    if (id) {
      const found = templates.find((t) => t.id === Number(id));
      setTemplate(found || null);
    }
  }, [id]);

  const handlePayment = async () => {
    await loadPaystackScript();

    if (!template) return;

    const handler = window.PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxxxxxxxxxx", // replace with your Paystack public key
      email: "customer@email.com", // replace dynamically
      amount: template.price * 100, // Paystack expects amount in kobo/cents
      currency: "ZAR", // or "NGN" depending on setup
      ref: "AD-" + Math.floor(Math.random() * 1000000000 + 1),
      callback: (response) => {
        ("Payment success:", response);
        alert("Payment successful! Ref: " + response.reference);
        router.push("/print-media/monetization/dashboard");
      },
      onClose: () => {
        alert("Transaction was not completed, window closed.");
      },
    });

    handler.openIframe();
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Payment</h1>
        <p className="text-gray-600 mb-2">
          <strong>Ad Template:</strong> {template.name}
        </p>
        <p className="text-gray-600 mb-2">
          <strong>Dimension:</strong> {template.dimension}
        </p>
        <p className="text-gray-600 mb-6">
          <strong>Amount:</strong> R{template.price}
        </p>

        <Button
          variant="default"
          className="w-full"
          onClick={handlePayment}
        >
          Pay with Paystack
        </Button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Secured by Paystack
        </p>
      </div>
    </div>
  );
}