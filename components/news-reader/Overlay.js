'use client';

import { useState } from 'react';

export default function RecommendedOverlayBottom({ articles }) {
  const [open, setOpen] = useState(false);
  const recommended = (articles || []).slice(0, 8);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-[#329ae1] text-white px-4 py-2 shadow-lg"
        >
          Recommended
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 w-full max-h-[80vh] bg-white rounded-t-2xl shadow-2xl transition-transform duration-200 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="text-lg font-semibold">Recommended for you</h3>
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {recommended.map((a, i) => (
            <div key={i} className="border rounded-md p-3 hover:shadow-sm transition">
              <p className="text-sm text-gray-500 mb-1">{a.source_id}</p>
              <h4 className="font-semibold text-gray-900">{a.title}</h4>
            </div>
          ))}

          {recommended.length === 0 && (
            <p className="text-sm text-gray-500">No recommendations yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
