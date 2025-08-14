// import React, { useState } from 'react';
// import { AlertCircle, CheckCircle, RefreshCw, Database, ArrowRight } from 'lucide-react';

// const ArticleMigrationTool = () => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [migrationResult, setMigrationResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState('check'); // 'check', 'ready', 'migrating', 'complete'

//   // Get current user on component mount
//   React.useEffect(() => {
//     try {
//       const userData = localStorage.getItem('currentUser');
//       if (userData) {
//         const user = JSON.parse(userData);
//         setCurrentUser(user);
//       }
//     } catch (error) {
//       console.error('Error reading user data:', error);
//     }
//   }, []);

//   const analyzeCurrentState = async () => {
//     if (!currentUser?.uid) {
//       alert('Please log in to run migration');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/migrate-articles?publisherId=${currentUser.uid}`);
//       const result = await response.json();
      
//       if (result.success) {
//         setAnalysisResult(result);
//         setStep(result.needsMigration ? 'ready' : 'complete');
//       } else {
//         alert('Failed to analyze collections: ' + result.error);
//       }
//     } catch (error) {
//       console.error('Error analyzing:', error);
//       alert('Error analyzing collections: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const runMigration = async () => {
//     if (!currentUser?.uid) {
//       alert('Please log in to run migration');
//       return;
//     }

//     if (!confirm('Are you sure you want to run the migration? This will move articles between collections.')) {
//       return;
//     }

//     setLoading(true);
//     setStep('migrating');
    
//     try {
//       const response = await fetch('/api/migrate-articles', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           publisherId: currentUser.uid
//         })
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setMigrationResult(result);
//         setStep('complete');
//       } else {
//         alert('Migration failed: ' + result.error);
//         setStep('ready');
//       }
//     } catch (error) {
//       console.error('Error during migration:', error);
//       alert('Migration error: ' + error.message);
//       setStep('ready');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!currentUser) {
//     return (
//       <div className="max-w-2xl mx-auto p-6">
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
//             <span className="text-yellow-800">Please log in to access the migration tool.</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-blue-600 text-white p-6">
//           <div className="flex items-center">
//             <Database className="w-8 h-8 mr-3" />
//             <div>
//               <h1 className="text-2xl font-bold">Article Collection Migration Tool</h1>
//               <p className="text-blue-100 mt-1">
//                 One-time fix to organize your articles and drafts correctly
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Step 1: Check Current State */}
//           {step === 'check' && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">Step 1: Analyze Current State</h2>
//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <p className="text-gray-700 mb-4">
//                   This tool will analyze your current articles and drafts to determine if migration is needed.
//                   The migration will:
//                 </p>
//                 <ul className="list-disc list-inside text-gray-600 space-y-2">
//                   <li>Move draft articles from 'articles' collection to 'drafts' collection</li>
//                   <li>Ensure published articles stay in 'articles' collection</li>
//                   <li>Fix status fields and data structure</li>
//                   <li>Preserve all your content and metadata</li>
//                 </ul>
//               </div>
              
//               <button
//                 onClick={analyzeCurrentState}
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
//               >
//                 {loading ? (
//                   <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                 ) : (
//                   <Database className="w-5 h-5 mr-2" />
//                 )}
//                 {loading ? 'Analyzing...' : 'Analyze Collections'}
//               </button>
//             </div>
//           )}

//           {/* Step 2: Show Analysis Results */}
//           {(step === 'ready' || step === 'complete') && analysisResult && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              
//               <div className="grid md:grid-cols-2 gap-6 mb-6">
//                 {/* Articles Collection */}
//                 <div className="border border-gray-200 rounded-lg p-4">
//                   <h3 className="font-semibold text-gray-800 mb-3">Articles Collection</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span>Total documents:</span>
//                       <span className="font-medium">{analysisResult.currentState.articlesCollection.total}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>✅ Properly published:</span>
//                       <span className="font-medium text-green-600">
//                         {analysisResult.currentState.articlesCollection.published}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>⚠️ Should be drafts:</span>
//                       <span className="font-medium text-yellow-600">
//                         {analysisResult.currentState.articlesCollection.drafts}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>❓ Unclear status:</span>
//                       <span className="font-medium text-red-600">
//                         {analysisResult.currentState.articlesCollection.unclear}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Drafts Collection */}
//                 <div className="border border-gray-200 rounded-lg p-4">
//                   <h3 className="font-semibold text-gray-800 mb-3">Drafts Collection</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span>Total documents:</span>
//                       <span className="font-medium">{analysisResult.currentState.draftsCollection.total}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>✅ Proper drafts:</span>
//                       <span className="font-medium text-green-600">
//                         {analysisResult.currentState.draftsCollection.properDrafts}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>⚠️ Needs fixing:</span>
//                       <span className="font-medium text-yellow-600">
//                         {analysisResult.currentState.draftsCollection.improperlyMarked}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Migration Status */}
//               {analysisResult.needsMigration ? (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//                   <div className="flex items-start">
//                     <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-yellow-800 font-medium">Migration Needed</p>
//                       <p className="text-yellow-700 text-sm mt-1">
//                         {analysisResult.recommendations.shouldMigrateDrafts} draft articles need to be moved to the drafts collection.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                   <div className="flex items-start">
//                     <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-green-800 font-medium">No Migration Needed</p>
//                       <p className="text-green-700 text-sm mt-1">
//                         Your articles and drafts are already properly organized!
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Migration Button */}
//               {step === 'ready' && analysisResult.needsMigration && (
//                 <div className="flex gap-4">
//                   <button
//                     onClick={runMigration}
//                     disabled={loading}
//                     className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
//                   >
//                     {loading ? (
//                       <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                     ) : (
//                       <ArrowRight className="w-5 h-5 mr-2" />
//                     )}
//                     Run Migration
//                   </button>
                  
//                   <button
//                     onClick={analyzeCurrentState}
//                     disabled={loading}
//                     className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
//                   >
//                     Re-analyze
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 3: Migration in Progress */}
//           {step === 'migrating' && (
//             <div className="text-center py-8">
//               <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
//               <h2 className="text-xl font-semibold mb-2">Migration in Progress</h2>
//               <p className="text-gray-600">Please wait while we reorganize your articles and drafts...</p>
//             </div>
//           )}

//           {/* Step 4: Migration Complete */}
//           {step === 'complete' && migrationResult && (
//             <div>
//               <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
//                 <div className="flex items-center mb-4">
//                   <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
//                   <h2 className="text-xl font-semibold text-green-800">Migration Completed Successfully!</h2>
//                 </div>
                
//                 <div className="grid md:grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="font-medium text-green-800 mb-2">Migration Statistics:</p>
//                     <ul className="space-y-1 text-green-700">
//                       <li>• Documents processed: {migrationResult.statistics.totalDocumentsProcessed}</li>
//                       <li>• Drafts moved to drafts collection: {migrationResult.statistics.draftsMovedToDraftsCollection}</li>
//                       <li>• Articles kept in articles collection: {migrationResult.statistics.articlesKeptInArticlesCollection}</li>
//                       <li>• Existing drafts updated: {migrationResult.statistics.existingDraftsUpdated}</li>
//                     </ul>
//                   </div>
                  
//                   <div>
//                     <p className="font-medium text-green-800 mb-2">What's Fixed:</p>
//                     <ul className="space-y-1 text-green-700">
//                       <li>✅ Articles are in 'articles' collection</li>
//                       <li>✅ Drafts are in 'drafts' collection</li>
//                       <li>✅ Status fields are correct</li>
//                       <li>✅ Dashboard will now work properly</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <p className="text-blue-800">
//                   <strong>Next steps:</strong> You can now refresh your publisher dashboard. Your articles and drafts should appear in the correct tabs.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ArticleMigrationTool;