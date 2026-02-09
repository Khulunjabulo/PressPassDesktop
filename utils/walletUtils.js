import { doc, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '@/Firebase/firebase' // Adjust this path to match your firebase config

// Add earnings from ads, sponsored articles, etc.
export async function addEarnings(publisherId, amount, source, description) {
  try {
    if (!publisherId) {
      throw new Error('Publisher ID is required')
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    ('Adding earnings:', { publisherId, amount, source, description })
    
    const walletRef = doc(db, 'publishers', publisherId, 'wallet', 'data')
    
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      source: source, // 'ads', 'sponsored', 'referral'
      description: description,
      amount: amount,
      type: 'earning',
      status: 'success'
    }

    await updateDoc(walletRef, {
      availableBalance: increment(amount),
      totalEarnings: increment(amount),
      transactions: arrayUnion(transaction)
    })

    ('Earnings added successfully:', transaction)
    return { success: true, transaction }
  } catch (error) {
    console.error('Error adding earnings:', error)
    return { success: false, error: error.message }
  }
}

// Handle withdrawals with Paystack
export async function processWithdrawal(publisherId, amount, method, details) {
  try {
    if (!publisherId) {
      throw new Error('Publisher ID is required')
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    ('Processing withdrawal:', { publisherId, amount, method, details })

    // For now, let's create a mock withdrawal (you can implement Paystack later)
    const walletRef = doc(db, 'publishers', publisherId, 'wallet', 'data')
    
    const transaction = {
      id: `withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      amount: amount,
      type: 'withdrawal',
      status: 'processing', // Will be 'success' when Paystack confirms
      method: method
    }

    await updateDoc(walletRef, {
      availableBalance: increment(-amount),
      withdrawn: increment(amount),
      transactions: arrayUnion(transaction)
    })

    ('Withdrawal processed:', transaction)
    return { success: true, transaction }
  } catch (error) {
    console.error('Withdrawal error:', error)
    return { success: false, error: error.message }
  }
}

// Revenue tracking functions
export async function trackAdRevenue(publisherId, adRevenue) {
  const result = await addEarnings(
    publisherId, 
    adRevenue, 
    'ads', 
    'Advertisement Revenue'
  )
  
  if (result.success) {
    ('Ad revenue added to wallet:', result.transaction)
  }
  
  return result
}

export async function trackSponsoredArticle(publisherId, amount, articleTitle) {
  const result = await addEarnings(
    publisherId, 
    amount, 
    'sponsored', 
    `Sponsored: ${articleTitle}`
  )
  
  return result
}

export async function trackReferralBonus(publisherId, amount) {
  const result = await addEarnings(
    publisherId, 
    amount, 
    'referral', 
    'Referral Bonus'
  )
  
  return result
}