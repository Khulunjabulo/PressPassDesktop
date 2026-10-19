"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "pp_cookie_consent";

function getConsent() {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(COOKIE_NAME + "="));
  return match ? match.split("=")[1] : null;
}

function setConsentCookie(value) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const CATEGORIES = ["essential", "analytics", "preferences", "marketing"];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    essential: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const save = (value) => {
    setConsentCookie(value);
    setVisible(false);
  };

  const acceptAll = () => {
    const all = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true,
    };
    setPrefs(all);
    save(JSON.stringify(all));
  };

  const acceptSelected = () => {
    save(JSON.stringify(prefs));
  };

  const rejectAll = () => {
    const none = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false,
    };
    setPrefs(none);
    save(JSON.stringify(none));
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-white shadow-2xl border border-gray-200 p-5 sm:p-6">
        {!showPrefs ? (
          <>
            <h2
              className="font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              We use cookies 🍪
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Press Pass uses cookies to keep you signed in, remember your
              preferences and understand how the site is used. You can accept
              all cookies or choose which categories to allow. Essential cookies
              are always required for the site to work.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowPrefs(true)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Customize
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Reject non-essential
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm rounded-lg text-white hover:opacity-90"
                style={{ background: "#329ae1" }}
              >
                Accept all
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              className="font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Cookie preferences
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose which cookie categories Press Pass may use. Essential
              cookies cannot be disabled because the site needs them to
              function.
            </p>
            <ul className="space-y-3 mb-4">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {cat}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat === "essential"
                        ? "Required for sign-in, security and core features."
                        : cat === "analytics"
                          ? "Helps us understand how the site is used."
                          : cat === "preferences"
                            ? "Remembers your settings like layout and language."
                            : "Used to personalise ads and content."}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={cat === "essential"}
                    checked={prefs[cat]}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, [cat]: e.target.checked }))
                    }
                    className="h-5 w-5 accent-[#329ae1]"
                    aria-label={`${cat} cookies`}
                  />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Reject non-essential
              </button>
              <button
                onClick={acceptSelected}
                className="px-4 py-2 text-sm rounded-lg text-white hover:opacity-90"
                style={{ background: "#329ae1" }}
              >
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
