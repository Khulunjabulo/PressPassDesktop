'use client'

import React, { useState, useEffect } from "react";
import { Facebook, Linkedin } from "lucide-react";

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── Reusable modal shell ──────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-3 w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 text-sm text-gray-500 leading-relaxed space-y-3">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-[#329ae1] text-white text-sm font-medium px-5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Privacy Policy content ────────────────────────────────────────────────────
function PrivacyContent() {
  return (
    <>
      <p>Press Pass ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share data when you use our services.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Information we collect</h3>
      <p>We collect information you provide directly, such as when you create an account, subscribe to newsletters, or contact our support team. This may include your name, email address, and usage preferences.</p>
      <p>We also automatically collect data including IP addresses, browser type, and pages visited to help us improve our services.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">How we use your information</h3>
      <p>We use your data to deliver and improve our services, personalise your experience, and comply with legal obligations. We do not sell your personal data to third parties.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Cookies</h3>
      <p>Press Pass uses cookies to enhance your browsing experience and analyse site traffic. You can control cookie preferences through your browser settings.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Your rights</h3>
      <p>You may have the right to access, correct, or delete your personal data. Contact us at privacy@presspass.com to exercise these rights.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Contact us</h3>
      <p>Questions? Reach us at privacy@presspass.com — Press Pass, Privacy Team, 123 Media Lane, Johannesburg, South Africa.</p>
    </>
  );
}

// ── Terms of Use content ──────────────────────────────────────────────────────
function TermsContent() {
  return (
    <>
      <p>By accessing or using Press Pass, you agree to be bound by these Terms of Use. Please read them carefully before using our services.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Use of the platform</h3>
      <p>Press Pass grants you a limited, non-exclusive, non-transferable licence to access and use our platform for personal, non-commercial purposes. You may not reproduce, distribute, or create derivative works without our written consent.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Publisher responsibilities</h3>
      <p>Publishers are solely responsible for the accuracy and legality of content they submit. Press Pass reserves the right to remove content that violates our guidelines or applicable law without prior notice.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Intellectual property</h3>
      <p>All trademarks, logos, and content on Press Pass are the property of their respective owners. Unauthorised use is strictly prohibited.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Limitation of liability</h3>
      <p>Press Pass is provided "as is". We make no warranties regarding availability, accuracy, or fitness for a particular purpose. To the fullest extent permitted by law, we are not liable for any indirect or consequential damages arising from your use of the platform.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Governing law</h3>
      <p>These terms are governed by the laws of the Republic of South Africa. Disputes shall be resolved in the courts of Johannesburg.</p>

      <h3 className="text-sm font-medium text-gray-800 pt-2">Contact us</h3>
      <p>Questions about these terms? Email us at legal@presspass.com — Press Pass, Legal Team, 123 Media Lane, Johannesburg, South Africa.</p>
    </>
  );
}

// ── PrintMediaFooter ──────────────────────────────────────────────────────────
export default function PrintMediaFooter() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms]     = useState(false);

  return (
    <>
      {showPrivacy && (
        <Modal title="Privacy Policy" subtitle="Last updated: January 1, 2025" onClose={() => setShowPrivacy(false)}>
          <PrivacyContent />
        </Modal>
      )}
      {showTerms && (
        <Modal title="Terms of Use" subtitle="Last updated: January 1, 2025" onClose={() => setShowTerms(false)}>
          <TermsContent />
        </Modal>
      )}

      <footer className="w-full bg-[#329ae1] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Corporate info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-medium mb-1">Corporate Info</h3>
            <a href="/print-media" className="text-sm text-blue-100 hover:text-white transition-colors">
              ABOUT PRESS PASS
            </a>
          </div>

          {/* Legal links */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-white transition-colors bg-transparent border-none text-blue-100 cursor-pointer text-sm"
              >
                Terms of Use
              </button>
              <span>|</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="hover:text-white transition-colors bg-transparent border-none text-blue-100 cursor-pointer text-sm"
              >
                Privacy Policy
              </button>
            </div>
            <p className="text-xs text-blue-100">© 2025 Press Pass. All rights reserved.</p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://www.x.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="X"
            >
              <XLogo />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61580291516955"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

        </div>
      </footer>
    </>
  );
}