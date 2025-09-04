import { useState, useEffect } from 'react'
import { db } from '@/Firebase/firebase' // Adjust path to your firebase config
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'

export function useWallet(publisherId) {
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    totalEarnings: 0,
    withdrawn: 0,
    transactions: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!publisherId) {
      setWallet(prev => ({ ...prev, loading: false }))
      return
    }

    console.log('Setting up wallet listener for publisher:', publisherId)

    // Real-time listener for wallet data
    const walletRef = doc(db, 'publishers', publisherId, 'wallet', 'data')
    
    const unsubscribe = onSnapshot(walletRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          console.log('Wallet data received:', data)
          
          setWallet({
            availableBalance: data.availableBalance || 0,
            totalEarnings: data.totalEarnings || 0,
            withdrawn: data.withdrawn || 0,
            transactions: (data.transactions || []).sort((a, b) => 
              new Date(b.timestamp?.toDate?.() || b.timestamp || 0) - 
              new Date(a.timestamp?.toDate?.() || a.timestamp || 0)
            ),
            loading: false,
            error: null
          })
        } else {
          console.log('Wallet document does not exist, creating...')
          // Create wallet if it doesn't exist
          createWalletForPublisher(publisherId)
        }
      },
      (error) => {
        console.error('Wallet fetch error:', error)
        setWallet(prev => ({ 
          ...prev, 
          error: error.message, 
          loading: false 
        }))
      }
    )

    return () => {
      console.log('Cleaning up wallet listener')
      unsubscribe()
    }
  }, [publisherId])

  return wallet
}

// Function to create wallet for new publishers
async function createWalletForPublisher(publisherId) {
  try {
    console.log('Creating wallet for publisher:', publisherId)
    
    const walletRef = doc(db, 'publishers', publisherId, 'wallet', 'data')
    await setDoc(walletRef, {
      availableBalance: 0,
      totalEarnings: 0,
      withdrawn: 0,
      transactions: [],
      createdAt: serverTimestamp()
    })
    
    console.log('Wallet created successfully for publisher:', publisherId)
  } catch (error) {
    console.error('Error creating wallet:', error)
  }
}