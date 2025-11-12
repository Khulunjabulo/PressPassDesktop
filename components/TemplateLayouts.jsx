import React from 'react';
import { Camera, User, Calendar, Clock } from 'lucide-react';

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

export const FashionMagazineLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen font-serif">
    <div className="relative h-96 overflow-hidden">
      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
        <p className="text-sm uppercase tracking-widest mb-2">{article.category || 'Fashion'}</p>
        <h1 className="text-6xl font-bold mb-4" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '2px'}}>{article.title}</h1>
        {article.subtitle && <p className="text-xl italic opacity-90">{article.subtitle}</p>}
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-8 py-12">
      {article.featuredImageUrl && article.imageCredit && (
        <div className="mb-6 text-sm italic text-gray-600 border-l-4 border-gray-300 pl-4">
          Photo: {article.imageCredit}
          {article.imageCaption && (
            <div className="mt-1 not-italic text-gray-700">{article.imageCaption}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center space-x-4 text-sm">
          <span className="font-medium">By {article.author}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">{formatDate(article.createdAt)}</span>
        </div>
      </div>

      <div className="text-lg leading-relaxed" style={{fontFamily: 'Cormorant Garamond, serif', lineHeight: '1.8'}} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-12 pt-6 border-t text-sm text-gray-500 italic">
          Template Design: {article.templateCredit}
        </div>
      )}
    </div>
  </div>
);

export const TechBusinessLayout = ({ article, isPreview }) => (
  <div className="bg-gray-50 min-h-screen">
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
      <div className="max-w-6xl mx-auto px-8">
        <div className="inline-block bg-blue-500 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4">
          {article.category || 'Technology'}
        </div>
        <h1 className="text-5xl font-bold mb-4 leading-tight">{article.title}</h1>
        {article.subtitle && <p className="text-xl text-blue-100">{article.subtitle}</p>}
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white rounded-lg shadow-md p-8">
          {article.featuredImageUrl && (
            <div className="mb-6">
              <img src={article.featuredImageUrl} alt={article.title} className="w-full h-64 object-cover rounded-lg" />
              {article.imageCredit && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="italic">Photo: {article.imageCredit}</span>
                  {article.imageCaption && (
                    <div className="mt-1 text-gray-700">{article.imageCaption}</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
            <span className="flex items-center"><User className="w-4 h-4 mr-1" />{article.author}</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDate(article.createdAt)}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{article.readTime || 5} min read</span>
          </div>

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">Key Highlights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Innovation Focus</li>
              <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Industry Insights</li>
              <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Expert Analysis</li>
            </ul>
          </div>
          
          {article.templateCredit && (
            <div className="bg-blue-50 rounded-lg p-4 text-xs text-gray-600">
              <Camera className="w-4 h-4 mb-2" />
              Template: {article.templateCredit}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const ClassicNewspaperLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    <style jsx>{`
      .newspaper-body { 
        font-family: Georgia, serif; 
        column-count: 2; 
        column-gap: 2rem; 
        text-align: justify; 
      }
      @media (max-width: 768px) { 
        .newspaper-body { column-count: 1; } 
      }
    `}</style>

    <div className="border-b-4 border-black">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="text-center mb-4">
          <h1 className="text-6xl font-bold" style={{fontFamily: 'Times New Roman, Times, serif'}}>THE DAILY PRESS</h1>
          <div className="flex items-center justify-center space-x-4 text-sm mt-2 border-t border-b border-black py-2">
            <span>{formatDate(article.createdAt)}</span>
            <span>•</span>
            <span>TODAY'S EDITION</span>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-4">
        <span className="inline-block bg-black text-white px-4 py-1 text-xs font-bold uppercase">
          {article.category || 'News'}
        </span>
      </div>

      <h1 className="text-5xl font-bold leading-tight mb-4 border-b-4 border-black pb-4" style={{fontFamily: 'Times New Roman, Times, serif'}}>
        {article.title}
      </h1>

      {article.subtitle && (
        <h2 className="text-xl italic text-gray-700 mb-6">{article.subtitle}</h2>
      )}

      <div className="flex items-center space-x-4 text-sm mb-6 pb-4 border-b-2 border-gray-400">
        <span className="font-bold">By {article.author}</span>
        <span>•</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>

      {article.featuredImageUrl && (
        <div className="float-left w-96 mr-6 mb-4">
          <img src={article.featuredImageUrl} alt={article.title} className="w-full border-2 border-black" />
          <div className="mt-2 text-xs text-gray-600 border-l-2 border-black pl-2">
            {article.imageCredit ? (
              <>
                <div className="italic">Photo: {article.imageCredit}</div>
                {article.imageCaption && (
                  <div className="mt-1 not-italic">{article.imageCaption}</div>
                )}
              </>
            ) : (
              <div className="italic">{article.title}</div>
            )}
          </div>
        </div>
      )}

      <div className="newspaper-body text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      
      <div className="clear-both"></div>
      
      {article.templateCredit && (
        <div className="mt-8 pt-4 border-t-2 border-black text-xs text-gray-600">
          Template Credit: {article.templateCredit}
        </div>
      )}
    </div>
  </div>
);

export const MagazineFeatureLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    {article.featuredImageUrl && (
      <div className="relative h-screen">
        <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <p className="text-sm uppercase tracking-widest mb-4 text-yellow-400">{article.category || 'Feature'}</p>
            <h1 className="text-7xl font-bold mb-6 leading-tight drop-shadow-lg">{article.title}</h1>
            {article.subtitle && <p className="text-2xl font-light max-w-3xl mx-auto">{article.subtitle}</p>}
          </div>
        </div>
        {article.imageCredit && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded">
            Photo: {article.imageCredit}
          </div>
        )}
      </div>
    )}

    <div className="max-w-4xl mx-auto px-8 py-16">
      {article.imageCaption && (
        <div className="mb-8 text-center text-gray-600 italic">
          {article.imageCaption}
        </div>
      )}

      <div className="flex items-center justify-center space-x-6 mb-12 text-sm">
        <span className="font-medium text-lg">{article.author}</span>
        <span>•</span>
        <span className="text-gray-600">{formatDate(article.createdAt)}</span>
      </div>

      <div className="prose prose-lg max-w-none" style={{ fontSize: '1.125rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-16 pt-8 border-t text-center text-sm text-gray-500 italic">
          Photography & Design: {article.templateCredit}
        </div>
      )}
    </div>
  </div>
);

export const MinimalCleanLayout = ({ article, isPreview }) => (
  <div className="bg-white min-h-screen">
    <div className="max-w-3xl mx-auto px-8 py-20">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-wider text-gray-500">{article.category || 'Article'}</span>
      </div>

      <h1 className="text-6xl font-light mb-6 leading-tight">{article.title}</h1>
      
      {article.subtitle && (
        <p className="text-xl text-gray-600 font-light mb-12">{article.subtitle}</p>
      )}

      <div className="flex items-center space-x-4 mb-12 pb-8 border-b text-sm text-gray-500">
        <span>{article.author}</span>
        <span>·</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>

      {article.featuredImageUrl && (
        <div className="mb-12">
          <img src={article.featuredImageUrl} alt={article.title} className="w-full h-96 object-cover" />
          {article.imageCredit && (
            <div className="mt-3 text-sm text-gray-500 italic">
              Photo: {article.imageCredit}
              {article.imageCaption && (
                <div className="mt-1 not-italic text-gray-600">{article.imageCaption}</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="prose prose-lg max-w-none font-light" style={{ lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {article.templateCredit && (
        <div className="mt-16 pt-8 border-t text-sm text-gray-400 text-center">
          {article.templateCredit}
        </div>
      )}
    </div>
  </div>
);

export const ModernGridLayout = ({ article, isPreview }) => (
  <div className="bg-gray-100 min-h-screen">
    <div className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-yellow-400 text-sm uppercase tracking-widest">{article.category || 'Featured'}</span>
            <h1 className="text-6xl font-bold mt-4 mb-6">{article.title}</h1>
            {article.subtitle && <p className="text-xl text-gray-300">{article.subtitle}</p>}
            <div className="flex items-center space-x-4 mt-8 text-sm">
              <span>{article.author}</span>
              <span>•</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>
          {article.featuredImageUrl && (
            <div>
              <img src={article.featuredImageUrl} alt={article.title} className="w-full h-96 object-cover rounded-lg shadow-2xl" />
              {article.imageCredit && (
                <div className="mt-3 text-sm text-gray-300 italic">
                  Photo: {article.imageCredit}
                  {article.imageCaption && (
                    <div className="mt-1 not-italic text-gray-400">{article.imageCaption}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
      
      {article.templateCredit && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Design: {article.templateCredit}
        </div>
      )}
    </div>
  </div>
);

export const EditorialLayout = ({ article, isPreview }) => (
  <div className="bg-amber-50 min-h-screen">
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="bg-white shadow-2xl p-12 border-t-8 border-amber-600">
        <div className="text-center mb-12">
          <div className="inline-block bg-amber-600 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider mb-6">
            {article.category || 'Editorial'}
          </div>
          <h1 className="text-5xl font-serif font-bold mb-4">{article.title}</h1>
          {article.subtitle && <p className="text-xl text-gray-600 italic">{article.subtitle}</p>}
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8 pb-8 border-b-2 border-amber-200 text-sm">
          <span className="font-medium">{article.author}</span>
          <span>•</span>
          <span className="text-gray-600">{formatDate(article.createdAt)}</span>
        </div>

        {article.featuredImageUrl && (
          <div className="mb-8">
            <img src={article.featuredImageUrl} alt={article.title} className="w-full h-80 object-cover border-4 border-amber-100" />
            {article.imageCredit && (
              <div className="mt-3 text-sm text-gray-600 text-center">
                <span className="italic">Photo: {article.imageCredit}</span>
                {article.imageCaption && (
                  <div className="mt-1">{article.imageCaption}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="prose prose-lg max-w-none font-serif" dangerouslySetInnerHTML={{ __html: article.content }} />
        
        {article.templateCredit && (
          <div className="mt-12 pt-8 border-t-2 border-amber-200 text-center text-sm text-gray-500">
            Template by {article.templateCredit}
          </div>
        )}
      </div>
    </div>
  </div>
);