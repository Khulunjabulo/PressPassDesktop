// app/api/ad-prices/route.js
// PUBLIC (no auth) — publisher side calls this to get current ad prices
import { NextResponse } from 'next/server';
import { db } from '@/Firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_PRICES = { 1: 500, 2: 500, 3: 500, 4: 500, 5: 500 };

export async function GET() {
  try {
    const snap = await getDoc(doc(db, 'config', 'adPrices'));

    if (!snap.exists()) {
      return NextResponse.json({
        success: true,
        prices: DEFAULT_PRICES,
        source: 'defaults',
      });
    }

    const data = snap.data();
    return NextResponse.json({
      success: true,
      prices: data.prices || DEFAULT_PRICES,
      updatedAt: data.updatedAt || null,
      source: 'firestore',
    });
  } catch (error) {
    console.error('GET /api/ad-prices error:', error);
    // Always return something usable — never break the publisher page
    return NextResponse.json({
      success: true,
      prices: DEFAULT_PRICES,
      source: 'fallback',
      error: error.message,
    });
  }
}

export const dynamic = 'force-dynamic';