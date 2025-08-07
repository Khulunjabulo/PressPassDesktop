// "// pages/favorites/[publication].js"
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowLeft, Heart, Share, BookOpen, Clock } from "lucide-react";
// import { useFavorites } from '../../hooks/useFavorites';

// export default function PublicationFavorites() {
//   const router = useRouter();
//   const { publication, type } = router.query;
//   const { favorites, loading, removeFromFavorites } = useFavorites();
//   const [publicationStories, setPublicationStories] = useState([]);

//   useEffect(() => {
//     if (publication && favorites.length > 0) {
//       const decodedPublication = decodeURIComponent(publication);
//       const stories = favorites.filter(fav => 
//         (fav.publicationName === decodedPublication || fav.source === decodedPublication) &&
//         fav.type === type
//       );
//       setPublicationStories(stories);
//     }
//   }, [publication, type, favorites]);

//   const handleRemoveFavorite = async (itemId) => {
//     const result = await removeFromFavorites(itemId);
//     if (result.success) {
//       // Story will be automatically removed from list due to state update in useFavorites
//     } else {
//       alert('Failed to remove from favorites: ' + result.error);
//     }
//   };

//   const handleStoryClick = (story) => {
//     if (story.link || story.url) {
//       window.open(story.
//         // pages/favorites/[publication].js
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowLeft, Heart, Share, BookOpen, Clock } from "lucide-react";
// import { useFavorites } from '../../hooks/useFavorites';

// export default function PublicationFavorites() {
//   const router = useRouter();
//   const { publication, type } = router.query;
//   const { favorites, loading, removeFromFavorites } = useFavorites();
//   const [publicationStories, setPublicationStories] = useState([]);

//   useEffect(() => {
//     if (publication && favorites.length > 0) {
//       const decodedPublication = decodeURIComponent(publication);
//       const stories = favorites.filter(fav => 
//         (fav.publicationName === decodedPublication || fav.source === decodedPublication) &&
//         fav.type === type
//       );
//       setPublicationStories(stories);
//     }
//   }, [publication, type, favorites]);

//   const handleRemoveFavorite = async (itemId) => {
//     const result = await removeFromFavorites(itemId);
//     if (result.success) {
//       // Story will be automatically removed from list due to state update in useFavorites
//     } else {
//       alert('Failed to remove from favorites: ' + result.error);
//     }
//   };

//   const handleStoryClick = (story) => {
//     if (story.link || story.url) {
//       window.open(story.link || story.url, '_blank');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown date';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading stories...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <header className="bg-blue-500 text-white px-4 py-3">
//         <div className="flex items-center justify-between max-w-7xl mx-auto">
//           <div className="flex items-center space-x-4">
//             <button 
//               onClick={() => router.back()}
//               className="p-2 hover:bg-blue-600 rounded-full transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <h1 className="text-xl md:text-2xl font-bold">
//               {publication ? decodeURIComponent(publication) : 'Publication'} Favorites
//             </h1>
//           </div>
//           <div className="text-sm">
//             {publicationStories.length} {publicationStories.length === 1 ? 'story' : 'stories'}
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto p-4">
//         {publicationStories.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-600 mb-2">No stories found</h3>
//             <p className="text-gray-500 mb-4">
//               No favorite stories from {publication ? decodeURIComponent(publication) : 'this publication'}
//             </p>
//             <button 
//               onClick={() => router.push('/news-reader')}
//               className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               Browse Stories
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {publicationStories.map((story, index) => (
//               <Card key={story.id || index} className="hover:shadow-lg transition-shadow">
//                 <CardContent className="p-0">
//                   <div className="flex flex-col md:flex-row">
//                     {/* Story Image */}
//                     <div className="md:w-1/3">
//                       {story.image || story.urlToImage ? (
//                         <img 
//                           src={story.image || story.urlToImage} 
//                           alt={story.title}
//                           className="w-full h-48 md:h-full object-cover rounded-l-lg"
//                         />
//                       ) : (
//                         <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
//                           <BookOpen className="w-12 h-12 text-gray-400" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Story Content */}
//                     <div className="md:w-2/3 p-6">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <h3 
//                             className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600 transition-colors"
//                             onClick={() => handleStoryClick(story)}
//                           >
//                             {story.title}
//                           </h3>
//                           <p className="text-gray-600 text-sm mb-3 line-clamp-3">
//                             {story.description || story.content || 'No description available'}
//                           </p>
//                         </div>
//                         <button
//                           onClick={() => handleRemoveFavorite(story.id)}
//                           className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
//                           title="Remove from favorites"
//                         >
//                           <Heart className="w-5 h-5 fill-current" />
//                         </button>
//                       </div>

//                       {/* Story Meta */}
//                       <div className="flex items-center justify-between text-sm text-gray-500">
//                         <div className="flex items-center space-x-4">
//                           <div className="flex items-center space-x-1">
//                             <Clock className="w-4 h-4" />
//                             <span>{formatDate(story.pubDate || story.publishedAt || story.addedAt)}</span>
//                           </div>
//                           {story.category && (
//                             <span className="bg-gray-100 px-2 py-1 rounded text-xs">
//                               {story.category}
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           {story.link || story.url ? (
//                             <button
//                               onClick={() => handleStoryClick(story)}
//                               className="text-blue-500 hover:text-blue-700 transition-colors"
//                             >
//                               Read More
//                             </button>
//                           ) : null}
//                           <button
//                             onClick={() => {
//                               if (navigator.share) {
//                                 navigator.share({
//                                   title: story.title,
//                                   url: story.link || story.url || window.location.href
//                                 });
//                               } else {
//                                 navigator.clipboard.writeText(story.link || story.url || window.location.href);
//                                 alert('Link copied to clipboard!');
//                               }
//                             }}
//                             className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
//                             title="Share story"
//                           >
//                             <Share className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }