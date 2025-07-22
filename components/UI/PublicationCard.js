
export function PublicationCard({ logoText, logoBgColor, publicationName }) {
  return (
    <div className="flex items-center gap-4 p-2 rounded-lg shadow-sm">
      <div
        className="flex items-center justify-center w-20 h-16 rounded-md shrink-0"
        style={{ backgroundColor: logoBgColor }}
      >
        <span className="text-sm font-semibold text-white">{logoText}</span>
      </div>
      <div className="flex-1 text-sm font-medium">{publicationName}</div>
      <div
        id={`subscribe-${publicationName.toLowerCase().replace(/\s/g, "-")}`}
        className="w-5 h-5"
      />
    </div>
  );
}
