'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { CreditCard, Smartphone, Wallet, ArrowLeft, CheckCircle, XCircle, Loader2, Mail, Edit2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentPageContent({ 
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
  
  const amount = searchParams?.get('amount') || propAmount;
  const currency = searchParams?.get('currency') || propCurrency;
  const description = searchParams?.get('description') || propDescription || 'Payment';
  const returnUrlParam = searchParams?.get('returnUrl') || returnUrl;
  
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
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [activatingAd, setActivatingAd] = useState(false);
  const [activationError, setActivationError] = useState(null);
  
  // Email fields
  const [userEmail, setUserEmail] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  
  const paymentElementRef = useRef(null);

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
    }
  ];

  // Get user email from localStorage (from sign-in)
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserEmail(user.email || '');
        setInvoiceEmail(user.email || '');
        setCompanyName(user.companyName || user.firstName + ' ' + user.lastName || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Load Stripe
  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        setStripe(stripeInstance);
        console.log('✅ [PAYMENT-PAGE] Stripe loaded successfully');
      } catch (error) {
        console.error('❌ [PAYMENT-PAGE] Failed to load Stripe:', error);
        setErrorMessage('Payment system failed to load. Please refresh.');
      }
    };
    
    if (!stripe) {
      loadStripeInstance();
    }
  }, []);

  // Create payment intent
  useEffect(() => {
    if (amount && !clientSecret) {
      createPaymentIntent();
    }
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      console.log('💳 [PAYMENT-PAGE] Creating payment intent...', { 
        amount, 
        currency, 
        metadata 
      });
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency.toLowerCase(),
          metadata,
        }),
      });
      
      const data = await response.json();
      
      console.log('📥 [PAYMENT-PAGE] Payment intent response:', data);
      
      if (data.success) {
        console.log('✅ [PAYMENT-PAGE] Payment intent created:', {
          paymentIntentId: data.paymentIntentId,
          amount: data.amount,
          currency: data.currency
        });
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
    } catch (error) {
      console.error('🚨 [PAYMENT-PAGE] Payment intent creation error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Stripe Elements
  useEffect(() => {
    if (stripe && clientSecret && !elements) {
      console.log('🎨 [PAYMENT-PAGE] Initializing Stripe Elements...');
      
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
      console.log('✅ [PAYMENT-PAGE] Stripe Elements initialized');
    }
  }, [stripe, clientSecret]);

  // Mount payment element
  useEffect(() => {
    if (!elements || paymentElementRef.current) return;
    
    try {
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
        console.log('✅ [PAYMENT-PAGE] Payment element ready');
        setLoading(false);
      });
      
      paymentElement.on('change', (event) => {
        if (event.error) {
          setErrorMessage(event.error.message);
        } else {
          setErrorMessage('');
        }
      });
      
      console.log('✅ [PAYMENT-PAGE] Payment element mounted');
      
    } catch (error) {
      console.error('❌ [PAYMENT-PAGE] Error mounting payment element:', error);
      setErrorMessage('Failed to initialize payment form');
    }
    
    return () => {
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.unmount();
          paymentElementRef.current.destroy();
        } catch (e) {
          console.warn('[PAYMENT-PAGE] Cleanup warning:', e);
        }
        paymentElementRef.current = null;
      }
    };
  }, [elements]);

  // Send invoice email after successful payment
  const sendInvoice = async (paymentData) => {
    try {
      setSendingInvoice(true);
      console.log('📧 [PAYMENT-PAGE] Sending invoice email...');

      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invoiceEmail,
          company: companyName,
          paymentIntentId: paymentData.paymentIntentId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          adDetails: metadata,
          publisherId: metadata.publisherId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [PAYMENT-PAGE] Invoice sent successfully:', data.invoiceNumber);
      } else {
        console.error('❌ [PAYMENT-PAGE] Failed to send invoice:', data.error);
      }
      
    } catch (error) {
      console.error('🚨 [PAYMENT-PAGE] Error sending invoice:', error);
    } finally {
      setSendingInvoice(false);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please try again.');
      return;
    }

    // Validate invoice email
    if (!invoiceEmail || !invoiceEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for the invoice.');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('💳 [PAYMENT-PAGE] Processing payment...');
      
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrlParam || window.location.origin + '/payment/success',
        },
      });
      
      if (error) {
        console.error('❌ [PAYMENT-PAGE] Stripe payment error:', error);
        throw new Error(error.message);
      }
      
      console.log('📊 [PAYMENT-PAGE] Payment intent status:', paymentIntent.status);
      
      if (paymentIntent.status === 'succeeded') {
        console.log('✅ [PAYMENT-PAGE] Payment succeeded! Payment ID:', paymentIntent.id);
        
        // Verify payment
        console.log('🔍 [PAYMENT-PAGE] Verifying payment with server...');
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        
        const verifyData = await verifyResponse.json();
        console.log('📥 [PAYMENT-PAGE] Verification response:', verifyData);
        
        if (verifyData.success && verifyData.verified) {
          setPaymentStatus('success');
          
          // Send invoice email
          await sendInvoice({
            paymentIntentId: paymentIntent.id,
            amount: verifyData.amount,
            currency: verifyData.currency,
            metadata: verifyData.metadata
          });
          
          // If this is an ad payment, activate the ad
          if (metadata.type === 'ad_space') {
            console.log('🎯 [PAYMENT-PAGE] This is an ad payment, activating ad...');
            await activateAd(paymentIntent.id);
          }
          
          if (onSuccess) {
            onSuccess({
              paymentIntentId: paymentIntent.id,
              amount: verifyData.amount,
              currency: verifyData.currency,
              metadata: verifyData.metadata
            });
          }
          
          // Redirect after delay
          if (returnUrlParam) {
            setTimeout(() => {
              window.location.href = returnUrlParam + '?payment=success&id=' + paymentIntent.id;
            }, 3000);
          }
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
      }
      
    } catch (error) {
      console.error('🚨 [PAYMENT-PAGE] Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

const activateAd = async (paymentIntentId) => {
  try {
    setActivatingAd(true);
    setActivationError(null);
    console.log('🔓 [PAYMENT-PAGE] ========== STARTING ACTIVATION ==========');
    console.log('🔓 [PAYMENT-PAGE] Payment Intent ID:', paymentIntentId);
    
    // Get uploadId from metadata (stored during payment creation)
    const uploadId = metadata.uploadId;
    
    console.log('📤 [PAYMENT-PAGE] Sending activation request:', {
      paymentIntentId,
      uploadId
    });
    
    const response = await fetch('/api/activate-ad-after-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        uploadId
      }),
    });

    console.log('📥 [PAYMENT-PAGE] Response status:', response.status);
    
    const result = await response.json();
    console.log('📥 [PAYMENT-PAGE] Response data:', result);
    
    if (result.success) {
      console.log('✅ [PAYMENT-PAGE] Ad activated successfully:', result.data);
      
      // Clean up sessionStorage
      try {
        sessionStorage.removeItem('pendingAdPayment');
        console.log('🧹 [PAYMENT-PAGE] Cleaned up sessionStorage');
      } catch (cleanupError) {
        console.warn('⚠️ [PAYMENT-PAGE] Failed to clean sessionStorage:', cleanupError);
      }
      
      console.log('🎉 [PAYMENT-PAGE] ========== ACTIVATION COMPLETE ==========');
    } else {
      const errorMsg = result.error || 'Ad activation failed';
      console.error('❌ [PAYMENT-PAGE] Activation failed:', errorMsg);
      setActivationError(errorMsg);
      setErrorMessage(`Payment successful, but failed to activate ad: ${errorMsg}. Please contact support with payment ID: ${paymentIntentId}.`);
    }
    
  } catch (error) {
    console.error('💥 [PAYMENT-PAGE] ========== ACTIVATION ERROR ==========');
    console.error('💥 [PAYMENT-PAGE] Error:', error);
    setActivationError(error.message);
    setErrorMessage(`Payment successful, but failed to activate ad. Please contact support with payment ID: ${paymentIntentId}.`);
  } finally {
    setActivatingAd(false);
  }
};

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
          
          {sendingInvoice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">
                  Sending invoice to {invoiceEmail}...
                </p>
              </div>
            </div>
          )}

          {!sendingInvoice && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  ✓ Invoice sent to {invoiceEmail}
                </p>
              </div>
            </div>
          )}

          {metadata.type === 'ad_space' && (
            <div className={`border rounded-lg p-4 mb-4 ${
              activationError 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              {activatingAd ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">
                    Activating your advertisement...
                  </p>
                </div>
              ) : activationError ? (
                <>
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Payment Successful, but Ad Activation Pending
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">
                    Your payment was successful but we encountered an issue activating your ad.
                  </p>
                  <p className="text-xs text-yellow-600 font-mono bg-yellow-100 p-2 rounded">
                    Payment ID: {paymentIntentId}
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Please contact support with this payment ID.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    ✅ Your ad is now live!
                  </p>
                  <p className="text-xs text-blue-600">
                    {metadata.templateName} - {metadata.deviceType} ({metadata.dimensions})
                  </p>
                </>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: {paymentIntentId}
          </p>
          {returnUrlParam && !activationError && (
            <p className="text-sm text-gray-500">
              Redirecting you back...
            </p>
          )}
          {activationError && (
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
              <div className="w-32 h-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">PressPass</span>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
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
                          <div className="font-medium text-gray-900">{method.name}</div>
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
              
              {/* Invoice Email Section */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Invoice Email</h4>
                  </div>
                  {!isEditingEmail && userEmail && (
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Change
                    </button>
                  )}
                </div>
                
                {isEditingEmail || !userEmail ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={invoiceEmail}
                        onChange={(e) => setInvoiceEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {userEmail && (
                      <button
                        onClick={() => {
                          setIsEditingEmail(false);
                          setInvoiceEmail(userEmail);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-medium">{invoiceEmail}</p>
                    {companyName && <p className="text-sm text-gray-600">{companyName}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Invoice will be sent to this email after payment
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{description}</span>
                </div>
                {metadata.type === 'ad_space' && (
                  <div className="text-xs text-gray-500 space-y-1 mb-2">
                    <div>Template: {metadata.templateName}</div>
                    <div>Device: {metadata.deviceType}</div>
                    <div>Size: {metadata.dimensions}</div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currency} {amount}
                  </span>
                </div>
              </div>

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
                disabled={loading || !stripe || !elements || paymentStatus === 'success' || !invoiceEmail}
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

export default function PaymentPage(props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageContent {...props} />
    </Suspense>
  );
}