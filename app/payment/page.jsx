// components/payment/PaymentPage.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { CreditCard, Smartphone, Wallet, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentPage({ 
  amount: propAmount,
  currency: propCurrency = 'ZAR',
  description: propDescription,
  metadata: propMetadata,
  onSuccess,
  onCancel,
  returnUrl,
  showBackButton = true
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get data from URL params or props (URL takes precedence)
  const amount = searchParams?.get('amount') || propAmount;
  const currency = searchParams?.get('currency') || propCurrency;
  const description = searchParams?.get('description') || propDescription || 'Payment';
  const returnUrlParam = searchParams?.get('returnUrl') || returnUrl;
  
  // Parse metadata from URL or use prop
  let metadata = propMetadata || {};
  try {
    const metadataParam = searchParams?.get('metadata');
    if (metadataParam) {
      metadata = { ...metadata, ...JSON.parse(decodeURIComponent(metadataParam)) };
    }
  } catch (e) {
    console.warn('Failed to parse metadata:', e);
  }

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  
  const paymentElementRef = useRef(null);
  const mountPointRef = useRef(null);

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'card',
      name: 'Card Payment',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      supported: true,
      stripeType: ['card']
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: Smartphone,
      description: 'Fast & secure payment',
      supported: true,
      stripeType: ['card', 'google_pay']
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: Wallet,
      description: 'Pay with Apple devices',
      supported: true,
      stripeType: ['card', 'apple_pay']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Wallet,
      description: 'Pay with PayPal account',
      supported: false, // Requires separate Stripe setup
      comingSoon: true
    }
  ];

  // Load Stripe
  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        setStripe(stripeInstance);
        console.log('✅ Stripe loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load Stripe:', error);
        setErrorMessage('Payment system failed to load. Please refresh the page.');
      }
    };
    
    if (!stripe) {
      loadStripeInstance();
    }
  }, []);

  // Create payment intent when component mounts
  useEffect(() => {
    if (amount && !clientSecret) {
      createPaymentIntent();
    }
  }, [amount]);

  // Create payment intent
  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      console.log('💳 Creating payment intent...', { amount, currency, metadata });
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency.toLowerCase(),
          metadata,
          // Determine payment method types based on selection
          paymentMethodTypes: getPaymentMethodTypes()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Payment intent created:', data.paymentIntentId);
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
    } catch (error) {
      console.error('🚨 Payment intent creation error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get payment method types for Stripe based on selection
  const getPaymentMethodTypes = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    return method?.stripeType || ['card'];
  };

  // Initialize Stripe Elements when clientSecret is available
  useEffect(() => {
    if (stripe && clientSecret && !elements) {
      console.log('🎨 Initializing Stripe Elements...');
      
      const elementsInstance = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      });
      
      setElements(elementsInstance);
    }
  }, [stripe, clientSecret]);

  // Mount payment element
  useEffect(() => {
    if (!elements || paymentElementRef.current) return;
    
    try {
      // Create payment element with all payment methods enabled
      const paymentElement = elements.create('payment', {
        layout: {
          type: 'accordion',
          defaultCollapsed: false,
          radios: true,
          spacedAccordionItems: true
        }
      });
      
      paymentElementRef.current = paymentElement;
      paymentElement.mount('#payment-element-mount');
      
      paymentElement.on('ready', () => {
        console.log('✅ Payment element ready');
        setLoading(false);
      });
      
      paymentElement.on('change', (event) => {
        console.log('Payment method changed:', event);
        if (event.error) {
          setErrorMessage(event.error.message);
        } else {
          setErrorMessage('');
        }
      });
      
      console.log('✅ Payment element mounted with automatic payment methods');
      
    } catch (error) {
      console.error('❌ Error mounting payment element:', error);
      setErrorMessage('Failed to initialize payment form');
    }
    
    return () => {
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.unmount();
          paymentElementRef.current.destroy();
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
        paymentElementRef.current = null;
      }
    };
  }, [elements]);

  // Handle payment submission
  const handlePayment = async () => {
    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please try again.');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('💳 Processing payment...');
      
      // Submit elements
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }
      
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrlParam || window.location.origin + '/payment/success',
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!');
        
        // Verify payment on server
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success && verifyData.verified) {
          setPaymentStatus('success');
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess({
              paymentIntentId: paymentIntent.id,
              amount: verifyData.amount,
              currency: verifyData.currency,
              metadata: verifyData.metadata
            });
          }
          
          // Redirect after 2 seconds if returnUrl provided
          if (returnUrlParam) {
            setTimeout(() => {
              window.location.href = returnUrlParam + '?payment=success&id=' + paymentIntent.id;
            }, 2000);
          }
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        throw new Error('Payment not completed');
      }
      
    } catch (error) {
      console.error('🚨 Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else if (returnUrlParam) {
      window.location.href = returnUrlParam;
    } else {
      router.back();
    }
  };

  // Success view
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of {currency} {amount} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: {paymentIntentId}
          </p>
          {returnUrlParam && (
            <p className="text-sm text-gray-500">
              Redirecting you back...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with logo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            )}
            <div className="flex-1 flex justify-center">
              {/* LOGO PLACEHOLDER - Replace with actual logo */}
              <div className="w-32 h-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">LOGO</span>
              </div>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => method.supported && setSelectedMethod(method.id)}
                      disabled={!method.supported || loading}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        !method.supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-6 h-6 text-gray-700 mr-3" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-gray-900 flex items-center">
                            {method.name}
                            {method.comingSoon && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{method.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{description}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currency} {amount}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              {/* Stripe Payment Element */}
              {clientSecret && stripe && elements ? (
                <div className="mb-6">
                  <div id="payment-element-mount"></div>
                  
                  {/* Debug Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                      <p className="font-semibold mb-1">🔍 Payment Debug Info:</p>
                      <p>• Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}</p>
                      <p>• Secure: {window.location.protocol === 'https:' ? '✅' : '❌ (needs HTTPS)'}</p>
                      <p>• Currency: {currency}</p>
                      <p className="mt-2 text-gray-600">
                        💡 Google Pay shows in Chrome with saved cards. Apple Pay shows in Safari on Mac/iOS.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading payment form...</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !stripe || !elements || paymentStatus === 'success'}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay {currency} {amount}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure payment powered by Stripe. Your payment information is encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}