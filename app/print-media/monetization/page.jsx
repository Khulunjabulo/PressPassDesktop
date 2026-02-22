'use client';
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/UI/header";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import {
  FileText, Users, Megaphone, LayoutDashboard, Menu, X,
  Monitor, Smartphone, Eye, CreditCard, Loader
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

// Lazy load heavy components
const DesktopPlaceholder = dynamic(
  () => import('@/components/placeholder/DesktopArticlePlaceholder'),
  { loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" /> }
);
const MobilePlaceholder = dynamic(
  () => import('@/components/placeholder/MobileArticlePlaceholder'),
  { loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" /> }
);
const AdUploadOverlay         = dynamic(() => import('@/components/AdUploadOverlay'));
const TermsAndConditionsModal = dynamic(() => import('@/components/placeholder/TermsAndConditionsModal'));
const AdPaymentForm           = dynamic(() => import('@/components/AdPaymentForm'));

// ── Defaults (used while API call is in flight) ───────────────────────────────
const DEFAULT_PRICES = { 1: 500, 2: 500, 3: 500, 4: 500, 5: 500 };

// ── Static template metadata — prices are injected from live API state ─────────
const TEMPLATE_META = {
  desktop: {
    1: { name: 'Headline',       dimension: '728w x 90h(px)',  fileSize: '200kb (JPEG, PNG, GIF)' },
    2: { name: 'Feed',           dimension: '300w x 250h(px)', fileSize: '150kb (JPEG, PNG, GIF)' },
    3: { name: 'Within Article', dimension: '300w x 250h(px)', fileSize: '150kb (JPEG, PNG, GIF)' },
    4: { name: 'Page Wrap 1',    dimension: '160w x 600h(px)', fileSize: '200kb (JPEG, PNG, GIF)' },
    5: { name: 'Page Wrap 2',    dimension: '160w x 600h(px)', fileSize: '200kb (JPEG, PNG, GIF)' },
  },
  mobile: {
    1: { name: 'Headline',       dimension: '320w x 50h(px)',  fileSize: '100kb (JPEG, PNG, GIF)' },
    2: { name: 'Feed',           dimension: '300w x 250h(px)', fileSize: '150kb (JPEG, PNG, GIF)' },
    3: { name: 'Within Article', dimension: '300w x 250h(px)', fileSize: '150kb (JPEG, PNG, GIF)' },
    4: { name: 'Page Wrap 1',    dimension: '300w x 600h(px)', fileSize: '200kb (JPEG, PNG, GIF)' },
    5: { name: 'Page Wrap 2',    dimension: '300w x 600h(px)', fileSize: '200kb (JPEG, PNG, GIF)' },
  },
};

const TEMPLATE_SPECS = {
  desktop: {
    1: { width: 728, height: 90  },
    2: { width: 300, height: 250 },
    3: { width: 300, height: 250 },
    4: { width: 160, height: 600 },
    5: { width: 160, height: 600 },
  },
  mobile: {
    1: { width: 320, height: 50  },
    2: { width: 300, height: 250 },
    3: { width: 300, height: 250 },
    4: { width: 300, height: 600 },
    5: { width: 300, height: 600 },
  },
};

export default function MonetizationPage() {
  const router = useRouter();

  // ── Publisher ───────────────────────────────────────────────────────────────
  const { publisher, loading: publisherLoading } = useCurrentPublisher();
  const [currentPublisherId, setCurrentPublisherId] = useState(null);
  const [isInitializing, setIsInitializing]         = useState(true);

  // ── Live ad prices ──────────────────────────────────────────────────────────
  const [adPrices, setAdPrices]           = useState(DEFAULT_PRICES);
  const [pricesLoading, setPricesLoading] = useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate]         = useState(null);
  const [isUploadOverlayOpen, setIsUploadOverlayOpen]   = useState(false);
  const [selectedTemplateId, setSelectedTemplateId]     = useState(null);
  const [menuOpen, setMenuOpen]                         = useState(false);
  const [deviceType, setDeviceType]                     = useState('desktop');
  const [uploadedAds, setUploadedAds]                   = useState({});
  const [showPreview, setShowPreview]                   = useState(false);
  const [previewAd, setPreviewAd]                       = useState(null);
  const [pendingUpload, setPendingUpload]               = useState(null);
  const [showTerms, setShowTerms]                       = useState(false);
  const [showPaymentForm, setShowPaymentForm]           = useState(false);
  const [paymentFormData, setPaymentFormData]           = useState(null);
  const [isEditingForm, setIsEditingForm]               = useState(false);

  // ── Fetch live prices from public endpoint ──────────────────────────────────
  const fetchAdPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const res    = await fetch('/api/ad-prices');
      const result = await res.json();
      if (result.success && result.prices) {
        // Keys come back as strings from JSON — normalise to numbers
        const normalised = {};
        Object.entries(result.prices).forEach(([k, v]) => {
          normalised[Number(k)] = Number(v);
        });
        setAdPrices(normalised);
        console.log('✅ Ad prices loaded:', normalised, '(source:', result.source, ')');
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch ad prices, keeping defaults:', err.message);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdPrices(); }, [fetchAdPrices]);

  // ── Build template rows — prices come from state, not hardcoded ─────────────
  const buildTemplates = useCallback(() =>
    [1, 2, 3, 4, 5].map(id => ({
      id,
      ...TEMPLATE_META[deviceType][id],
      price: adPrices[id] ?? DEFAULT_PRICES[id],
    })),
  [deviceType, adPrices]);

  // ── Publisher ID initialisation ─────────────────────────────────────────────
  useEffect(() => {
    let id = localStorage.getItem('currentPublisherId');
    if (!id) {
      try {
        const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
        id = u.uid || u.id || null;
        if (id) localStorage.setItem('currentPublisherId', id);
      } catch {}
    }
    if (!id && publisher?.id) {
      id = publisher.id;
      localStorage.setItem('currentPublisherId', id);
    }
    setCurrentPublisherId(id);
    setIsInitializing(false);
  }, [publisher]);

  useEffect(() => {
    if (publisher?.id && !currentPublisherId) {
      setCurrentPublisherId(publisher.id);
      localStorage.setItem('currentPublisherId', publisher.id);
    }
  }, [publisher, currentPublisherId]);

  // ── Fetch uploaded ads ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentPublisherId) return;
    fetch(`/api/get-ads?publisherId=${currentPublisherId}&deviceType=${deviceType}`)
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data) {
          const map = {};
          result.data.forEach(ad => {
            if (!map[ad.templateId]) map[ad.templateId] = [];
            map[ad.templateId].push(ad);
          });
          setUploadedAds(map);
        } else {
          setUploadedAds({});
        }
      })
      .catch(() => setUploadedAds({}));
  }, [currentPublisherId, deviceType]);

  // ── Upload flow ─────────────────────────────────────────────────────────────
  const handleOpenUploadForm = (templateId) => {
    if (!currentPublisherId) { alert('Please wait while we load your publisher profile...'); return; }
    setSelectedTemplateId(templateId);
    setIsEditingForm(false);
    setShowPaymentForm(true);
  };

  const handlePaymentFormSubmit = (formData) => {
    setPaymentFormData(formData);
    setShowPaymentForm(false);
    setIsUploadOverlayOpen(true);
  };

  const handleEditForm = () => {
    setShowPreview(false);
    setIsEditingForm(true);
    setShowPaymentForm(true);
  };

  const handleUploadComplete = async (file, destinationUrl) => {
    if (!destinationUrl?.trim()) { alert('⚠️ Destination URL is required!'); return { success: false }; }
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const previewData = { imageSrc: e.target.result, fileName: file.name, fileType: file.type, destinationUrl };
        setPreviewAd(previewData);
        setPendingUpload({ file, fileData: previewData, templateId: selectedTemplateId, deviceType, publisherId: currentPublisherId, destinationUrl, paymentFormData });
        setIsUploadOverlayOpen(false);
        setShowPreview(true);
        setSelectedTemplate(selectedTemplateId);
        resolve({ success: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAcceptTerms = async () => {
    if (!pendingUpload || !pendingUpload.destinationUrl || !currentPublisherId || !paymentFormData) {
      alert('Missing information. Please try again.');
      setShowTerms(false);
      return;
    }
    try {
      setShowTerms(false);
      const form = new FormData();
      form.append('file',           pendingUpload.file);
      form.append('publisherId',    currentPublisherId);
      form.append('templateId',     pendingUpload.templateId);
      form.append('deviceType',     pendingUpload.deviceType);
      form.append('destinationUrl', pendingUpload.destinationUrl);
      form.append('paymentStatus',  'pending');
      form.append('duration', JSON.stringify({
        type:      paymentFormData.durationType,
        quantity:  paymentFormData.customDuration,
        startDate: paymentFormData.startDate,
        endDate:   paymentFormData.endDate,
      }));
      form.append('notes', paymentFormData.notes || '');

      const uploadRes    = await fetch('/api/upload-ad-media', { method: 'POST', body: form });
      const uploadResult = await uploadRes.json();
      if (!uploadResult.success) throw new Error(uploadResult.error || 'Upload failed');

      const templates = buildTemplates();
      const spec      = TEMPLATE_SPECS[deviceType][pendingUpload.templateId];
      const tpl       = templates.find(t => t.id === pendingUpload.templateId);
      const adPrice   = paymentFormData.totalPrice;

      const metadata = {
        publisherId:    currentPublisherId,
        templateId:     pendingUpload.templateId,
        templateName:   tpl?.name || `Template ${pendingUpload.templateId}`,
        deviceType,
        fileName:       pendingUpload.file.name,
        dimensions:     `${spec.width}x${spec.height}`,
        destinationUrl: pendingUpload.destinationUrl,
        uploadId:       uploadResult.data.uploadId,
        duration: {
          type:      paymentFormData.durationType,
          quantity:  paymentFormData.customDuration,
          startDate: paymentFormData.startDate instanceof Date ? paymentFormData.startDate.toISOString() : paymentFormData.startDate,
          endDate:   paymentFormData.endDate   instanceof Date ? paymentFormData.endDate.toISOString()   : paymentFormData.endDate,
        },
        type: 'ad_space',
      };

      const paymentUrl =
        `/payment?amount=${adPrice}&currency=ZAR` +
        `&description=${encodeURIComponent(`${tpl?.name} - ${deviceType} (${spec.width}x${spec.height}px) - ${paymentFormData.customDuration} ${paymentFormData.durationType}(s)`)}` +
        `&metadata=${encodeURIComponent(JSON.stringify(metadata))}` +
        `&returnUrl=${encodeURIComponent(window.location.href)}`;

      try {
        sessionStorage.setItem('pendingAdPayment', JSON.stringify({
          uploadId: uploadResult.data.uploadId, publisherId: currentPublisherId,
          templateId: pendingUpload.templateId, deviceType,
          destinationUrl: pendingUpload.destinationUrl, duration: metadata.duration,
        }));
        localStorage.removeItem(`adForm_${pendingUpload.templateId}_${deviceType}`);
      } catch {}

      router.push(paymentUrl);
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Failed: ${error.message}. Please try again.`);
    }
  };

  const handlePreviewClose = () => { setShowPreview(false); setPreviewAd(null); setSelectedTemplate(null); };

  // ── Payment success return ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      sessionStorage.removeItem('pendingAdUpload');
      if (currentPublisherId) {
        fetch(`/api/get-ads?publisherId=${currentPublisherId}&deviceType=${deviceType}`)
          .then(r => r.json())
          .then(result => {
            if (result.success && result.data) {
              const map = {};
              result.data.forEach(ad => {
                if (!map[ad.templateId]) map[ad.templateId] = [];
                map[ad.templateId].push(ad);
              });
              setUploadedAds(map);
            }
          })
          .catch(() => {});
        alert('Payment successful! Your ad has been activated.');
      }
    }
  }, [currentPublisherId, deviceType]);

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isInitializing || publisherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading publisher profile...</p>
        </div>
      </div>
    );
  }

  if (!currentPublisherId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Publisher ID Not Found</h2>
          <p className="text-gray-700 mb-4">Please sign in to continue.</p>
          <Link href="/print-media/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Build live templates array (re-computes when prices or deviceType changes)
  const templates = buildTemplates();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header publisher={publisher} />

      {/* Sub-header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            Ad Templates — {deviceType === 'mobile' ? 'Mobile' : 'Desktop'} View
          </h1>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDeviceType('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                deviceType === 'desktop' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-600'
              }`}>
              <Monitor size={18} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceType('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                deviceType === 'mobile' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-600'
              }`}>
              <Smartphone size={18} />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
        <p className="text-sm text-green-800">
          ✅ <strong>Publisher:</strong> {currentPublisherId} |{' '}
          <strong>Device:</strong> {deviceType} |{' '}
          <strong>Total Ads:</strong> {Object.values(uploadedAds).flat().length}
        </p>
        {pricesLoading && (
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <Loader className="w-3 h-3 animate-spin" /> Loading prices…
          </span>
        )}
      </div>

      <h1 className="text-center text-lg sm:text-xl font-bold my-4 px-2">
        Click Upload to start your ad campaign!
      </h1>

      <div className="md:hidden flex items-center px-4 mb-2">
        <button className="p-2 rounded-md bg-white shadow" onClick={() => setMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 bg-white shadow-md border-r flex-col">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Menu</h2>
            <ul className="space-y-4">
              {[
                { href: '/print-media/monetization/publish',   icon: FileText,        label: 'Publish with us'   },
                { href: '/print-media/monetization/partner',   icon: Users,           label: 'Partner with us'   },
                { href: '/print-media/monetization/advertise', icon: Megaphone,       label: 'Advertise with us' },
                { href: '/print-media/monetization/dashboard', icon: LayoutDashboard, label: 'Dashboard'         },
              ].map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 hover:text-blue-600">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setMenuOpen(false)} />
            <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 animate-slide-in">
              <button className="absolute top-4 right-4 bg-gray-100 rounded-full p-1" onClick={() => setMenuOpen(false)}>
                <X size={24} />
              </button>
              <div className="p-4 mt-10">
                <h2 className="text-lg font-semibold mb-4">Menu</h2>
                <ul className="space-y-4">
                  {[
                    { href: '/print-media/monetization/publish',   icon: FileText,        label: 'Publish with us'   },
                    { href: '/print-media/monetization/partner',   icon: Users,           label: 'Partner with us'   },
                    { href: '/print-media/monetization/advertise', icon: Megaphone,       label: 'Advertise with us' },
                    { href: '/print-media/monetization/dashboard', icon: LayoutDashboard, label: 'Dashboard'         },
                  ].map(({ href, icon: Icon, label }) => (
                    <li key={href}>
                      <Link href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 hover:text-blue-600">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 p-2 sm:p-4 md:p-6">
          {/* ── Template table ── */}
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto mb-8">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#','Banner','Dimension','File Size','Base Price','Uploaded Ads','Upload','Preview'].map(h => (
                    <th key={h} className="text-left p-4 font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.map(template => {
                  const adsForTemplate = uploadedAds[template.id] || [];
                  return (
                    <tr key={template.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{template.id}</td>
                      <td className="p-4">{template.name}</td>
                      <td className="p-4 text-sm text-gray-600">{template.dimension}</td>
                      <td className="p-4 text-sm text-gray-600">{template.fileSize}</td>
                      <td className="p-4 text-sm font-semibold text-green-600">
                        {pricesLoading ? (
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Loader className="w-3 h-3 animate-spin" /> loading…
                          </span>
                        ) : (
                          <>
                            R{template.price.toLocaleString()}
                            <span className="text-gray-400 font-normal">/day</span>
                          </>
                        )}
                      </td>
                      <td className="p-4">
                        {adsForTemplate.length > 0
                          ? <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">{adsForTemplate.length} active</span>
                          : <span className="text-gray-400 text-sm">No ads uploaded</span>}
                      </td>
                      <td className="p-4">
                        <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 font-medium"
                          onClick={e => { e.stopPropagation(); handleOpenUploadForm(template.id); }}>
                          Upload
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={e => { e.stopPropagation(); setSelectedTemplate(template.id); setShowPreview(true); }}
                          className="text-green-600 underline hover:text-green-800 flex items-center gap-1">
                          <Eye size={14} /> Preview
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Live preview section ── */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-2">
              Live Preview — {deviceType === 'mobile' ? 'Mobile' : 'Desktop'}
            </h2>
            <p className="text-gray-600 mb-6">
              This shows how your ads will appear in articles on {deviceType} devices
            </p>
            {deviceType === 'desktop'
              ? <DesktopPlaceholder ads={uploadedAds} publisherId={currentPublisherId} />
              : <MobilePlaceholder  ads={uploadedAds} publisherId={currentPublisherId} />}
          </div>
        </main>
      </div>

      {/* ── Payment form modal ── */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <AdPaymentForm
              templateId={selectedTemplateId}
              templateName={templates.find(t => t.id === selectedTemplateId)?.name}
              dimension={templates.find(t => t.id === selectedTemplateId)?.dimension}
              deviceType={deviceType}
              basePrice={adPrices[selectedTemplateId] ?? DEFAULT_PRICES[selectedTemplateId]}
              onSubmit={handlePaymentFormSubmit}
              onCancel={() => { setShowPaymentForm(false); setIsEditingForm(false); }}
              initialData={isEditingForm ? paymentFormData : null}
              isEditing={isEditingForm}
            />
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-7xl w-full p-6 my-8 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Ad Preview</h2>
                <p className="text-gray-600 mt-1">
                  {templates.find(t => t.id === selectedTemplate)?.name} — {deviceType === 'mobile' ? 'Mobile' : 'Desktop'}
                </p>
              </div>
              <button onClick={handlePreviewClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              {deviceType === 'desktop'
                ? <DesktopPlaceholder ads={uploadedAds} previewAd={previewAd} highlightTemplate={selectedTemplate} publisherId={currentPublisherId} />
                : <MobilePlaceholder  ads={uploadedAds} previewAd={previewAd} highlightTemplate={selectedTemplate} publisherId={currentPublisherId} />}
            </div>
            <div className="flex justify-between items-center pt-4 border-t gap-4">
              <button onClick={handlePreviewClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Close Preview
              </button>
              {previewAd && paymentFormData && (
                <div className="flex gap-3">
                  <button onClick={handleEditForm} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                    Edit Campaign Details
                  </button>
                  <button onClick={() => setShowTerms(true)} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AdUploadOverlay isOpen={isUploadOverlayOpen} onClose={() => setIsUploadOverlayOpen(false)} onUpload={handleUploadComplete} deviceType={deviceType} />
      <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} onAccept={handleAcceptTerms} />
      <PrintMediaFooter />

      <style jsx global>{`
        @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
}