export function PublicationCard({ logoText = "News", logoBgColor = "#4F46E5", publicationName = "Untitled" }) {
  const safeId = publicationName?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "") || "publication";

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg shadow-sm bg-white hover:shadow-md transition">
      <div
        className="flex items-center justify-center w-20 h-16 rounded-md shrink-0"
        style={{ backgroundColor: logoBgColor }}
      >
        <span className="text-sm font-semibold text-white truncate text-center">
          {logoText.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">
        {publicationName}
      </div>
      <div
        id={`subscribe-${safeId}`}
        className="w-5 h-5"
      />
    </div>
  );
}
