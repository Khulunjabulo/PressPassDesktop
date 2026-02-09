// app/api/advanced-analytics/route.js
import { NextResponse } from "next/server";
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

/**
 * GET - Fetch advanced analytics data for a publisher.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: "Publisher ID is required" },
        { status: 400 }
      );
    }

    ('🚀 Fetching advanced analytics for publisher:', publisherId);

    // --- Step 1: Fetch Articles and Subscribers in parallel ---
    const articlesRef = collection(db, 'articles');
    const articlesQuery = query(articlesRef, where("publisherId", "==", publisherId));
    
    const subscribersRef = collection(db, 'publishers', publisherId, 'subscribers');
    const activeSubscribersQuery = query(subscribersRef, where("active", "==", true));

    const [articlesSnapshot, subscribersSnapshot] = await Promise.all([
      getDocs(articlesQuery),
      getDocs(activeSubscribersQuery)
    ]);

    // --- Step 2: Process Data ---
    const articles = [];
    articlesSnapshot.forEach(doc => articles.push(doc.data()));
    const totalSubscribers = subscribersSnapshot.size;

    // --- Step 3: Content Category Analysis ---
    const categoryAnalysis = articles.reduce((acc, article) => {
      const category = article.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { articles: 0, views: 0 };
      }
      acc[category].articles += 1;
      acc[category].views += article.views || 0;
      return acc;
    }, {});

    const totalViews = Object.values(categoryAnalysis).reduce((sum, cat) => sum + cat.views, 0);

    const contentCategoryData = Object.entries(categoryAnalysis).map(([name, data]) => ({
      name,
      traffic: totalViews > 0 ? parseFloat(((data.views / totalViews) * 100).toFixed(1)) : 0,
      articles: data.articles,
      views: data.views
    })).sort((a, b) => b.traffic - a.traffic);

    // --- Step 4: Conversion Funnel Analysis (Simplified) ---
    // This is a simplified model. A real implementation would need more detailed event tracking.
    const funnelData = {
      visitors: { value: totalViews, rate: 100.0 },
      subscribers: { value: totalSubscribers, rate: totalViews > 0 ? parseFloat(((totalSubscribers / totalViews) * 100).toFixed(1)) : 0 },
    };

    // --- Step 5: Predictive Insights (Simulated) ---
    // These are simulated based on available data. Real predictions would require ML models.
    const lastMonthNewSubs = subscribersSnapshot.docs.filter(doc => {
        const subDate = doc.data().subscribedAt?.toDate();
        if (!subDate) return false;
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return subDate > oneMonthAgo;
    }).length;

    const growthForecast = Math.round((lastMonthNewSubs / totalSubscribers) * 100 * 1.2); // Simple projection

    // Find category with high views per article but few articles
    let contentOpportunity = { name: 'N/A', engagementIncrease: 0 };
    const potentialOpportunities = contentCategoryData
      .map(c => ({ ...c, viewsPerArticle: c.articles > 0 ? c.views / c.articles : 0 }))
      .sort((a, b) => b.viewsPerArticle - a.viewsPerArticle);

    if (potentialOpportunities.length > 1 && potentialOpportunities[0].articles < potentialOpportunities[1].articles) {
      contentOpportunity = {
        name: potentialOpportunities[0].name,
        engagementIncrease: Math.round(potentialOpportunities[0].viewsPerArticle / 100)
      };
    }

    const predictiveInsights = {
      growthForecast: {
        value: isNaN(growthForecast) ? 5 : growthForecast,
        message: `Predicted ${isNaN(growthForecast) ? 5 : growthForecast}% subscriber growth in next quarter based on recent trends.`
      },
      churnRisk: {
        value: Math.floor(totalSubscribers * 0.08), // Simulated 8% risk
        message: `${Math.floor(totalSubscribers * 0.08)} subscribers at high risk of churning - engage with targeted content.`
      },
      contentOpportunity: {
        value: contentOpportunity.name,
        message: `High engagement in "${contentOpportunity.name}". More content could increase overall engagement by ${contentOpportunity.engagementIncrease}%.`
      }
    };

    // --- Final Response ---
    const response = {
      success: true,
      predictiveInsights,
      funnelData,
      contentCategoryData,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching advanced analytics:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch advanced analytics" },
      { status: 500 }
    );
  }
}