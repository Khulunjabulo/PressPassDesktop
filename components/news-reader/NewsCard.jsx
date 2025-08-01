export default function NewsCard({
  imageUrl = '',
  logoText = 'NEWS',
  logoBgColor = '#008000',
  title = 'Headline',
  description = 'Description snippet here...',
  author = 'Unknown',
  time = 'Unknown',
  isUploadedStory = false,
  pdfUrl = null,
  link = null,
}) {
  const truncate = (text = '', maxLength) =>
    text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  // Determine the link to use for "Read more"
  const readMoreLink = isUploadedStory && pdfUrl ? pdfUrl : link;

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
      {/* Left media box */}
      <div
        className="w-20 h-20 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: imageUrl ? 'transparent' : logoBgColor }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={logoText} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-xs text-center px-1">
            {logoText}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Add indicator for uploaded stories */}
        {isUploadedStory && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📰 Press Pass Story
            </span>
          </div>
        )}
        
        <h3 className="text-base font-bold text-gray-900">
          {truncate(title, 90)}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {truncate(description || '', 140)}
        </p>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="truncate max-w-[40%]">By: {author || 'Unknown'}</span>
          <span>{time}</span>
          {readMoreLink ? (
            <a
              href={readMoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              {isUploadedStory && pdfUrl ? 'View PDF' : 'Read more'}
            </a>
          ) : (
            <span className="text-blue-600 cursor-default">Read more</span>
          )}
        </div>
      </div>
    </div>
  );
}
