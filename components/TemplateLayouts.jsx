import React from 'react';
import { Camera, User, Calendar, Clock, Share2, Tag } from 'lucide-react';

const formatDate = (timestamp) => {
  if (!timestamp) {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  try {
    let date;
    
    if (timestamp && typeof timestamp === 'object') {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds && typeof timestamp.seconds === 'number') {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

const ShareButton = ({ article }) => {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.subtitle || article.metaDescription,
          url: window.location.href
        }).catch(err => console.log('Share failed:', err));
      } else {
        navigator.clipboard.writeText(window.location.href)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.log('Copy failed:', err));
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
      title="Share this article"
    >
      <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
};

const TagsList = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  
  const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center">
        <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Article Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tagArray.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export const FashionMagazineLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen font-serif">
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 text-white">
          <p className="text-xs sm:text-sm uppercase tracking-widest mb-2">{article.category || 'Fashion'}</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 leading-tight" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '1px'}}>{article.title}</h1>
          {article.subtitle && <p className="text-base sm:text-lg lg:text-xl italic opacity-90">{article.subtitle}</p>}
        </div>
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      {article.metaDescription && (
        <div className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-700 italic border-l-4 border-pink-500 pl-3 sm:pl-4">
          {article.metaDescription}
        </div>
      )}

      {article.featuredImageUrl && (
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 border-l-4 border-gray-300 pl-3 sm:pl-4">
          {article.imageCredit && (
            <div className="flex items-center italic mb-1">
              <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Photo: {article.imageCredit}
            </div>
          )}
          {article.imageCaption && (
            <div className="mt-1 not-italic text-gray-700">{article.imageCaption}</div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 border-b gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="font-medium">By {article.author}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">{formatDate(article.createdAt)}</span>
        </div>
      </div>

      {article.tags && (
        <div className="mb-6 sm:mb-8">
          <TagsList tags={article.tags} />
        </div>
      )}

      <div className="text-base sm:text-lg leading-relaxed" style={{fontFamily: 'Cormorant Garamond, serif', lineHeight: '1.8'}} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t text-xs sm:text-sm text-gray-500 italic">
          Template Design: {article.templateCredit}
        </div>
      )}
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const TechBusinessLayout = ({ article, isPreview }) => (
  <div className="bg-gray-50 min-h-screen">
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="inline-block bg-blue-500 px-3 sm:px-4 py-1 rounded-full text-xs font-bold uppercase mb-3 sm:mb-4">
          {article.category || 'Technology'}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">{article.title}</h1>
        {article.subtitle && <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-2">{article.subtitle}</p>}
        {article.metaDescription && (
          <p className="text-sm sm:text-base lg:text-lg text-blue-200 italic">{article.metaDescription}</p>
        )}
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          {article.featuredImageUrl && (
            <div className="mb-4 sm:mb-6">
              <img src={article.featuredImageUrl} alt={article.title} className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg" />
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                {article.imageCredit && (
                  <div className="flex items-center italic mb-1">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Photo:</span>
                    <span className="ml-1">{article.imageCredit}</span>
                  </div>
                )}
                {article.imageCaption && (
                  <div className="mt-1 text-gray-700">{article.imageCaption}</div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <span className="flex items-center"><User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{article.author}</span>
            <span className="flex items-center"><Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{formatDate(article.createdAt)}</span>
            <span className="flex items-center"><Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{article.readTime || 5} min read</span>
          </div>

          <div className="prose prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {article.tags && <TagsList tags={article.tags} />}
          
          {article.templateCredit && (
            <div className="bg-blue-50 rounded-lg p-4 text-xs text-gray-600">
              <Camera className="w-4 h-4 mb-2" />
              Template: {article.templateCredit}
            </div>
          )}
        </div>
      </div>
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const ClassicNewspaperLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    <style jsx>{`
      .newspaper-body { 
        font-family: Georgia, serif; 
        column-count: 1;
        column-gap: 2rem; 
        text-align: justify; 
      }
      @media (min-width: 768px) { 
        .newspaper-body { column-count: 2; } 
      }
    `}</style>

    <div className="border-b-2 sm:border-b-4 border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="text-center mb-2 sm:mb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold" style={{fontFamily: 'Times New Roman, Times, serif'}}>THE DAILY PRESS</h1>
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm mt-2 border-t border-b border-black py-2">
            <span>{formatDate(article.createdAt)}</span>
            <span>•</span>
            <span>TODAY'S EDITION</span>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-3 sm:mb-4">
        <span className="inline-block bg-black text-white px-3 sm:px-4 py-1 text-xs font-bold uppercase">
          {article.category || 'News'}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4 border-b-2 sm:border-b-4 border-black pb-3 sm:pb-4" style={{fontFamily: 'Times New Roman, Times, serif'}}>
        {article.title}
      </h1>

      {article.subtitle && (
        <h2 className="text-lg sm:text-xl italic text-gray-700 mb-3 sm:mb-4">{article.subtitle}</h2>
      )}

      {article.metaDescription && (
        <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 font-medium border-l-4 border-black pl-3 sm:pl-4">
          {article.metaDescription}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-400">
        <span className="font-bold">By {article.author}</span>
        <span>•</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>

      {article.tags && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border-2 border-black">
          <h3 className="font-bold text-xs sm:text-sm uppercase mb-2 flex items-center">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Story Tags
          </h3>
          <div className="text-xs sm:text-sm">
            {Array.isArray(article.tags) ? article.tags.join(', ') : article.tags}
          </div>
        </div>
      )}

      {article.featuredImageUrl && (
        <div className="sm:float-left w-full sm:w-80 lg:w-96 sm:mr-6 mb-4">
          <img src={article.featuredImageUrl} alt={article.title} className="w-full border-2 border-black" />
          <div className="mt-2 text-xs text-gray-600 border-l-2 border-black pl-2">
            {article.imageCredit && (
              <div className="flex items-center italic mb-1">
                <Camera className="w-3 h-3 mr-1" />
                Photo: {article.imageCredit}
              </div>
            )}
            {article.imageCaption && (
              <div className="mt-1 not-italic">{article.imageCaption}</div>
            )}
          </div>
        </div>
      )}

      <div className="newspaper-body text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      
      <div className="clear-both"></div>
      
      {article.templateCredit && (
        <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t-2 border-black text-xs text-gray-600">
          Template Credit: {article.templateCredit}
        </div>
      )}
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const MagazineFeatureLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    {article.featuredImageUrl && (
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-screen">
        <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <p className="text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4 text-yellow-400">{article.category || 'Feature'}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg">{article.title}</h1>
            {article.subtitle && <p className="text-lg sm:text-xl lg:text-2xl font-light max-w-3xl mx-auto mb-3 sm:mb-4">{article.subtitle}</p>}
            {article.metaDescription && <p className="text-sm sm:text-base lg:text-lg italic max-w-2xl mx-auto opacity-90">{article.metaDescription}</p>}
          </div>
        </div>
        {article.imageCredit && (
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black bg-opacity-80 text-white text-xs px-2 sm:px-4 py-1 sm:py-2 rounded flex items-center">
            <Camera className="w-3 h-3 mr-1 sm:mr-2" />
            Photo: {article.imageCredit}
          </div>
        )}
      </div>
    )}

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
      {article.imageCaption && (
        <div className="mb-6 sm:mb-8 text-center text-sm sm:text-base text-gray-600 italic">
          {article.imageCaption}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12 text-xs sm:text-sm">
        <span className="font-medium text-base sm:text-lg">{article.author}</span>
        <span>•</span>
        <span className="text-gray-600">{formatDate(article.createdAt)}</span>
      </div>

      {article.tags && (
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <TagsList tags={article.tags} />
        </div>
      )}

      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none" style={{ fontSize: '1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-10 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500 italic">
          Photography & Design: {article.templateCredit}
        </div>
      )}
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const MinimalCleanLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="mb-6 sm:mb-8">
        <span className="text-xs uppercase tracking-wider text-gray-500">{article.category || 'Article'}</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 leading-tight">{article.title}</h1>
      
      {article.subtitle && (
        <p className="text-lg sm:text-xl text-gray-600 font-light mb-4 sm:mb-6">{article.subtitle}</p>
      )}

      {article.metaDescription && (
        <p className="text-base sm:text-lg text-gray-700 italic mb-8 sm:mb-10 lg:mb-12 pb-4 sm:pb-6 border-b border-gray-200">
          {article.metaDescription}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8 border-b text-xs sm:text-sm text-gray-500">
        <span>{article.author}</span>
        <span>·</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>

      {article.tags && (
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-wrap gap-2 pb-6 sm:pb-8 border-b border-gray-200">
            <Tag className="w-4 h-4 text-gray-400" />
            {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tag, index) => (
              <span key={index} className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {article.featuredImageUrl && (
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <img src={article.featuredImageUrl} alt={article.title} className="w-full h-64 sm:h-80 lg:h-96 object-cover" />
          {(article.imageCredit || article.imageCaption) && (
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
              {article.imageCredit && (
                <div className="flex items-center italic mb-1">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Photo: {article.imageCredit}
                </div>
              )}
              {article.imageCaption && (
                <div className="not-italic text-gray-600">{article.imageCaption}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none font-light" style={{ lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-10 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t text-xs sm:text-sm text-gray-400 text-center">
          {article.templateCredit}
        </div>
      )}
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const ModernGridLayout = ({ article, isPreview }) => (
  <div className="bg-gray-100 min-h-screen">
    <div className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div>
            <span className="text-yellow-400 text-xs sm:text-sm uppercase tracking-widest">{article.category || 'Featured'}</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6 leading-tight">{article.title}</h1>
            {article.subtitle && <p className="text-lg sm:text-xl text-gray-300 mb-3 sm:mb-4">{article.subtitle}</p>}
            {article.metaDescription && <p className="text-base sm:text-lg text-gray-400 italic">{article.metaDescription}</p>}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-6 sm:mt-8 text-xs sm:text-sm">
              <span>{article.author}</span>
              <span>•</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>
          {article.featuredImageUrl && (
            <div>
              <img src={article.featuredImageUrl} alt={article.title} className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-2xl" />
              {(article.imageCredit || article.imageCaption) && (
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm">
                  {article.imageCredit && (
                    <div className="flex items-center text-gray-300 italic mb-1">
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Photo: {article.imageCredit}
                    </div>
                  )}
                  {article.imageCaption && (
                    <div className="not-italic text-gray-400">{article.imageCaption}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
      {article.tags && (
        <div className="mb-6 sm:mb-8">
          <TagsList tags={article.tags} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
      
      {article.templateCredit && (
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          Design: {article.templateCredit}
        </div>
      )}
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

export const EditorialLayout = ({ article, isPreview }) => (
  <div className="bg-amber-50 min-h-screen">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
      <div className="bg-white shadow-2xl p-6 sm:p-8 lg:p-12 border-t-4 sm:border-t-8 border-amber-600">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-block bg-amber-600 text-white px-4 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6">
            {article.category || 'Editorial'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3 sm:mb-4 leading-tight">{article.title}</h1>
          {article.subtitle && <p className="text-lg sm:text-xl text-gray-600 italic mb-3 sm:mb-4">{article.subtitle}</p>}
          {article.metaDescription && (
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto border-t border-b border-amber-200 py-3 sm:py-4 mt-4 sm:mt-6">
              {article.metaDescription}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-amber-200 text-xs sm:text-sm">
          <span className="font-medium">{article.author}</span>
          <span>•</span>
          <span className="text-gray-600">{formatDate(article.createdAt)}</span>
        </div>

        {article.tags && (
          <div className="mb-6 sm:mb-8">
            <div className="border-2 border-amber-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-bold text-xs sm:text-sm uppercase mb-2 flex items-center text-amber-700">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Article Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(article.tags) ? article.tags : article.tags.split(',')).map((tag, index) => (
                  <span key={index} className="bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {article.featuredImageUrl && (
          <div className="mb-6 sm:mb-8">
            <img src={article.featuredImageUrl} alt={article.title} className="w-full h-56 sm:h-64 lg:h-80 object-cover border-2 sm:border-4 border-amber-100" />
            {(article.imageCredit || article.imageCaption) && (
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 text-center bg-amber-50 p-2 sm:p-3 rounded">
                {article.imageCredit && (
                  <div className="flex items-center justify-center italic mb-1">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-amber-600" />
                    <span className="font-medium">Photo:</span>
                    <span className="ml-1">{article.imageCredit}</span>
                  </div>
                )}
                {article.imageCaption && (
                  <div className="mt-1">{article.imageCaption}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none font-serif" dangerouslySetInnerHTML={{ __html: article.content }} />
        
        {article.templateCredit && (
          <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t-2 border-amber-200 text-center text-xs sm:text-sm text-gray-500">
            Template by {article.templateCredit}
          </div>
        )}
      </div>
    </div>
    
    {!isPreview && <ShareButton article={article} />}
  </div>
);

// Demo component to show all templates
export default function TemplateDemo() {
  const sampleArticle = {
    title: "The Future of Technology",
    subtitle: "Exploring innovations that will shape tomorrow",
    metaDescription: "A comprehensive look at emerging technologies and their impact on society.",
    author: "Jane Smith",
    createdAt: new Date(),
    category: "Technology",
    featuredImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
    imageCredit: "Unsplash",
    imageCaption: "Modern technology in action",
    tags: ["Innovation", "Technology", "Future"],
    content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`,
    templateCredit: "Modern Design Studio"
  };

  const [currentTemplate, setCurrentTemplate] = React.useState('fashion');

  const templates = {
    fashion: <FashionMagazineLayout article={sampleArticle} isPreview={true} />,
    tech: <TechBusinessLayout article={sampleArticle} isPreview={true} />,
    newspaper: <ClassicNewspaperLayout article={sampleArticle} isPreview={true} />,
    magazine: <MagazineFeatureLayout article={sampleArticle} isPreview={true} />,
    minimal: <MinimalCleanLayout article={sampleArticle} isPreview={true} />,
    modern: <ModernGridLayout article={sampleArticle} isPreview={true} />,
    editorial: <EditorialLayout article={sampleArticle} isPreview={true} />
  };

  return (
    <div>
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold mb-2 text-sm">Select Template:</h3>
        <select 
          value={currentTemplate} 
          onChange={(e) => setCurrentTemplate(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="fashion">Fashion Magazine</option>
          <option value="tech">Tech Business</option>
          <option value="newspaper">Classic Newspaper</option>
          <option value="magazine">Magazine Feature</option>
          <option value="minimal">Minimal Clean</option>
          <option value="modern">Modern Grid</option>
          <option value="editorial">Editorial</option>
        </select>
      </div>
      {templates[currentTemplate]}
    </div>
  );
}