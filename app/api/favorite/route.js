import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const adminAuth = getAuth();

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getFavorites(req, res);
      case 'POST':
        return await addToFavorites(req, res);
      case 'DELETE':
        return await removeFromFavorites(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Favorites API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Get user's favorites
async function getFavorites(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      error: 'User ID is required' 
    });
  }

  try {
    const favoritesRef = doc(db, 'favorites', userId);
    const favoritesDoc = await getDoc(favoritesRef);

    if (!favoritesDoc.exists()) {
      return res.status(200).json({ 
        success: true, 
        favorites: [] 
      });
    }

    const data = favoritesDoc.data();
    return res.status(200).json({ 
      success: true, 
      favorites: data.items || [] 
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch favorites' 
    });
  }
}

// Add item to favorites
async function addToFavorites(req, res) {
  const { userId, item } = req.body;

  if (!userId || !item) {
    return res.status(400).json({ 
      success: false, 
      error: 'User ID and item are required' 
    });
  }

  // Validate required item fields
  const requiredFields = ['id', 'title', 'type']; // type: 'story', 'magazine', 'newspaper'
  const missingFields = requiredFields.filter(field => !item[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      success: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  try {
    const favoritesRef = doc(db, 'favorites', userId);
    const favoritesDoc = await getDoc(favoritesRef);

    const favoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
      id: item.id || `${item.type}_${Date.now()}` // Ensure unique ID
    };

    if (!favoritesDoc.exists()) {
      // Create new favorites document
      await setDoc(favoritesRef, {
        userId,
        items: [favoriteItem],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Check if item already exists
      const existingItems = favoritesDoc.data().items || [];
      const itemExists = existingItems.some(existingItem => 
        existingItem.id === favoriteItem.id || 
        (existingItem.title === favoriteItem.title && existingItem.type === favoriteItem.type)
      );

      if (itemExists) {
        return res.status(400).json({ 
          success: false, 
          error: 'Item already in favorites' 
        });
      }

      // Add to existing favorites
      await updateDoc(favoritesRef, {
        items: arrayUnion(favoriteItem),
        updatedAt: new Date().toISOString()
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Item added to favorites',
      item: favoriteItem
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to add to favorites' 
    });
  }
}

// Remove item from favorites
async function removeFromFavorites(req, res) {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ 
      success: false, 
      error: 'User ID and item ID are required' 
    });
  }

  try {
    const favoritesRef = doc(db, 'favorites', userId);
    const favoritesDoc = await getDoc(favoritesRef);

    if (!favoritesDoc.exists()) {
      return res.status(404).json({ 
        success: false, 
        error: 'No favorites found for user' 
      });
    }

    const existingItems = favoritesDoc.data().items || [];
    const itemToRemove = existingItems.find(item => item.id === itemId);

    if (!itemToRemove) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found in favorites' 
      });
    }

    // Remove the item
    await updateDoc(favoritesRef, {
      items: arrayRemove(itemToRemove),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Item removed from favorites' 
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to remove from favorites' 
    });
  }
}