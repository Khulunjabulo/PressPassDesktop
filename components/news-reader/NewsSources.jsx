// 'use client';

// import { useRouter } from 'next/navigation';
// import { Card, CardContent } from '@/components/UI/Cards';
// import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';
// import { useNewsSources } from '@/hooks/useNewsSources';
// import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';

// export default function NewsSources() {
//   const { newsources, loading, error, refreshSources } = useNewsSources();
//   const router = useRouter();

//   const handleSourceClick = (source) => {
//     router.push(`/news-reader/publisher/${source.id}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">News Sources</h1>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[1, 2, 3, 4, 5, 6].map((i) => (
//               <Card key={i} className="animate-pulse">
//                 <CardContent className="p-6">
//                   <div className="flex items-start space-x-4">
//                     <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
//                     <div className="flex-1 space-y-2">
//                       <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//                       <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//                       <div className="h-3 bg-gray-300 rounded w-2/3"></div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-900 mb-8">News Sources</h1>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
//                   <span className="text-red-600 text-sm">⚠</span>
//                 </div>
//               </div>
//               <div className="ml-3">
//                 <p className="text-red-800 font-medium">Error loading news sources</p>
//                 <p className="text-red-600 text-sm mt-1">{error}</p>
//               </div>
//             </div>
//             <button 
//               onClick={refreshSources}
//               className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">News Sources</h1>
//             <p className="text-gray-600 mt-2">Discover articles from registered publishers</p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <p className="text-sm text-gray-500">{newsources.length} publishers</p>
//             <button 
//               onClick={refreshSources}
//               className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Refresh
//             </button>
//           </div>
//         </div>
        
//         {newsources.length === 0 ? (
//           <div className="text-center py-12">
//             <Building className="mx-auto h-16 w-16 text-gray-400" />
//             <h3 className="mt-4 text-lg font-medium text-gray-900">No publishers yet</h3>
//             <p className="mt-2 text-gray-500 max-w-sm mx-auto">
//               Publisher cards will automatically appear here when they register. Each publisher gets their own folder for organizing articles.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {newsources.map((source) => (
//               <Card 
//                 key={source.id} 
//                 className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border-0 shadow-md bg-white relative overflow-hidden"
//               >
//                 {/* Background blur logo */}
//                 {source.logo && (
//                   <div 
//                     className="absolute inset-0 opacity-5 bg-cover bg-center"
//                     style={{
//                       backgroundImage: `url(${source.logo})`,
//                       filter: 'blur(20px)',
//                     }}
//                   />
//                 )}
                
//                 <CardContent className="p-6 relative z-10">
//                   <div className="flex items-start space-x-4">
//                     {/* Logo */}
//                     <div className="flex-shrink-0">
//                       {source.logo ? (
//                         <img
//                           src={source.logo}
//                           alt={`${source.name} logo`}
//                           className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-lg"
//                         />
//                       ) : (
//                         <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
//                           <span className="text-white font-bold text-xl">
//                             {source.name.charAt(0)}
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Content */}
//                     <div className="flex-1 min-w-0">
//                       {/* Header */}
//                       <div className="flex items-start justify-between mb-2">
//                         <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-2">
//                           {source.name}
//                         </h3>
//                         <div className="flex items-center space-x-1">
//                           <PublisherFavoriteButton 
//                             publisher={source}
//                             size="small"
//                             className="relative z-20"
//                           />
//                           <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
//                         </div>
//                       </div>
                      
//                       {/* Industry */}
//                       <div className="mb-3">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                           {source.industry}
//                         </span>
//                       </div>

//                       {/* Article count */}
//                       <div className="flex items-center space-x-2 mb-2">
//                         <FileText className="w-4 h-4 text-blue-600" />
//                         <span className="text-sm font-medium text-gray-700">
//                           {source.articleCount} {source.articleCount === 1 ? 'article' : 'articles'}
//                         </span>
//                         {!source.hasArticles && (
//                           <span className="text-xs text-orange-600 font-medium flex items-center">
//                             <Plus className="w-3 h-3 mr-1" /> New
//                           </span>
//                         )}
//                       </div>

//                       {/* Type */}
//                       <div className="flex items-center space-x-2 mb-2">
//                         <Users className="w-4 h-4 text-gray-500" />
//                         <span className="text-sm text-gray-600 capitalize">
//                           {source.publicationType} • {source.audienceType}
//                         </span>
//                       </div>

//                       {/* Website + Last Posted inline */}
//                       <div className="flex items-center space-x-4 mb-3">
//                         {source.website && (
//                           <div className="flex items-center space-x-1">
//                             <Globe className="w-4 h-4 text-gray-500" />
//                             <span className="text-sm text-gray-600 truncate max-w-[120px]">
//                               {source.website.replace(/^https?:\/\//, '')}
//                             </span>
//                           </div>
//                         )}
//                         <div className="flex items-center space-x-1">
//                           <Clock className="w-4 h-4 text-gray-500" />
//                           <span className="text-sm text-gray-500">
//                             {source.hasArticles ? `Last posted: ${source.lastPosted}` : source.lastPosted}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Read a Story from the Publisher */}
//                   <div className="mt-4 pt-4 border-t border-gray-100">
//                     <h4 className="text-md font-semibold text-gray-900 mb-1">Read a Story from {source.name}</h4>
//                     <p className="text-sm text-gray-600 line-clamp-3 mb-2">
//                       {source.sampleStory?.excerpt || "This publisher hasn’t shared a preview story yet. Stay tuned for updates."}
//                     </p>
//                     {source.sampleStory && (
//                       <button
//                         onClick={() => router.push(`/news-reader/article/${source.sampleStory.id}`)}
//                         className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                       >
//                         Read More
//                       </button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
