'use client';

export default function AdSlot({ label = 'Ads here', height = 250, color = 'bg-blue-200' }) {
  return (
    <div
      className={`w-full ${color} flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500`}
      style={{ height }}
      aria-label="Advertisement placeholder"
    >
      <p className="text-sm">{label}</p>
    </div>
  );
}
