'use client';

import { X, ChevronLeft, ChevronRight, ExternalLink, Building, Monitor, Smartphone, CreditCard, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/UI/newscard';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';
import TermsAndConditionsModal from '@/components/placeholder/TermsAndConditionsModal';
import DesktopPreview from '@/components/placeholder/DesktopPreview';
import MobilePreview from '@/components/placeholder/MobilePreview';

// ─── Helpers ────────────────────────────────────────────────────────────────

function dedupeArticles(articles = []) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = a.link || a.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripHtml(html) {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── AdSlot ─────────────────────────────────────────────────────────────────

function AdSlot({ adType, width, height, className = '', onAdvertiseClick, isBanner = false }) {
  const [ads, setAds]               = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`/api/ads?type=${adType}&status=active`);
        const data = await res.json();
        if (data.success) {
          setAds(data.ads.filter(
            (ad) => ad.desktopImage?.startsWith('data:image/') && ad.status === 'active'
          ));
        }
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [adType]);

  useEffect(() => {
    if (ads.length < 2) return;
    const id = setInterval(() => setCurrentIndex((p) => (p + 1) % (ads.length + 1)), 8000);
    return () => clearInterval(id);
  }, [ads.length]);

  const responsiveClass = (() => {
    if (isBanner) return '';
    if (adType.includes('sidebar') || adType.includes('rectangle') || adType.includes('skyscraper')) return 'hidden lg:block';
    if (adType === 'mobile') return 'block lg:hidden';
    return '';
  })();

  const containerStyle = isBanner
    ? { width: '100%', height: '90px' }
    : adType === 'mobile'
    ? { width: '100%', height: '250px', maxWidth: '320px', margin: '0 auto' }
    : { width, height };

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center ${className} ${responsiveClass}`} style={containerStyle}>
        <span className="text-gray-400 text-xs">Loading ad…</span>
      </div>
    );
  }

  const ad = ads[currentIndex];

  if (!ad || currentIndex >= ads.length) {
    return (
      <div
        className={`bg-gradient-to-r from-[#329ae1] to-[#1e7bc0] rounded-2xl shadow-lg shadow-[#329ae1]/10 cursor-pointer hover:shadow-xl hover:shadow-[#329ae1]/20 transition-all duration-300 ${className} ${responsiveClass}`}
        style={containerStyle}
        onClick={onAdvertiseClick}
      >
        <div className="h-full flex items-center justify-center p-4 text-center gap-3">
          <img src="/Presspass.png" alt="PressPass" width={isBanner ? 120 : 70} height={isBanner ? 120 : 70} className="object-contain" />
          <div className="text-left">
            <p className="text-yellow-400 font-bold text-sm">Advertise Here</p>
            <p className="text-white/80 text-xs">Partners@presspass.africa</p>
          </div>
          {isBanner && <span className="hidden sm:block text-white/40 text-xs font-medium ml-4">728 × 90</span>}
        </div>
      </div>
    );
  }

  const imgSrc = isMobile && ad.mobileImage?.startsWith('data:image/') ? ad.mobileImage : ad.desktopImage;

  return (
    <div className={`${className} ${responsiveClass}`}>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-shadow duration-300"
        style={{ ...containerStyle }}
        onClick={() => ad.url && window.open(ad.url, '_blank')}
      >
        <img src={imgSrc} alt={ad.title} className="w-full h-full object-cover" />
        <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[10px] font-medium tracking-wider uppercase">Ad</span>
      </div>
    </div>
  );
}

// ─── Ad Creation Modal ───────────────────────────────────────────────────────

function AdCreationModal({ isOpen, onClose, adType, dimensions }) {
  const [step, setStep]           = useState(1);
  const [formData, setFormData]   = useState({ title: '', url: '', desktopImage: null, mobileImage: null, desktopImagePreview: '', mobileImagePreview: '', contactEmail: '', company: '', duration: '1', customDuration: '' });
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  if (!isOpen) return null;

  const isBannerAd = adType === 'banner';

  const handleFileUpload = (file, type) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, [`${type}Image`]: 'Max 5 MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, [`${type}Image`]: 'Must be an image' })); return; }
    setUploadProgress(p => ({ ...p, [type]: 10 }));
    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(p => ({ ...p, [type]: Math.round((e.loaded / e.total) * 80) + 10 })); };
    reader.onload = (e) => {
      const b64 = e.target.result;
      if (!b64?.startsWith('data:image/')) { setErrors(p => ({ ...p, [`${type}Image`]: 'Failed to process image' })); return; }
      setErrors(p => { const n = { ...p }; delete n[`${type}Image`]; return n; });
      setFormData(p => ({ ...p, [`${type}Image`]: b64, [`${type}ImagePreview`]: b64 }));
      setUploadProgress(p => ({ ...p, [type]: 100 }));
      setTimeout(() => setUploadProgress(p => { const n = { ...p }; delete n[type]; return n; }), 2000);
    };
    reader.onerror = () => setErrors(p => ({ ...p, [`${type}Image`]: 'Failed to read file' }));
    reader.readAsDataURL(file);
  };

  const calculatePrice = () => {
    const days = formData.duration === 'custom' ? parseInt(formData.customDuration) || 0 : parseInt(formData.duration) || 0;
    const subtotal = days * 50;
    const discountPct = days >= 30 ? 0.20 : days >= 14 ? 0.15 : days >= 7 ? 0.10 : 0;
    const discount = subtotal * discountPct;
    return { days, subtotal, discount, total: subtotal - discount, discountPercentage: discountPct * 100 };
  };

  const validateStep1 = () => {
    const e = {};
    if (!formData.title.trim())   e.title = 'Required';
    if (!formData.url.trim())     e.url   = 'Required';
    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) e.url = 'Must start with http:// or https://';
    if (!formData.desktopImage)   e.desktopImage = 'Required';
    if (!formData.mobileImage)    e.mobileImage  = 'Required';
    if (!termsAccepted)           e.terms = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!formData.contactEmail?.trim()) e.contactEmail = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) e.contactEmail = 'Invalid email';
    if (!formData.duration && !formData.customDuration) e.duration = 'Select a duration';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const pricing = calculatePrice();
      const adData  = { ...formData, adType, dimensions, duration: pricing.days, startDate: new Date().toISOString(), endDate: new Date(Date.now() + pricing.days * 86400000).toISOString(), status: 'pending_payment', approved: false, createdAt: new Date().toISOString() };
      sessionStorage.setItem('pendingAdData', JSON.stringify(adData));
      const meta = { type: 'ad_space', adType, duration: `${pricing.days} day${pricing.days > 1 ? 's' : ''}`, company: formData.company || 'N/A', contactEmail: formData.contactEmail };
      window.location.href = `/payment?${new URLSearchParams({ amount: pricing.total.toFixed(2), currency: 'ZAR', description: `Advertisement: ${adType} - ${pricing.days} day${pricing.days > 1 ? 's' : ''}`, metadata: JSON.stringify(meta), returnUrl: window.location.href })}`;
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#329ae1]/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#329ae1]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Create {isBannerAd ? 'Banner' : 'Advertisement'}</h2>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-700 hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 1 && (
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-500">Step 1 of 3 — Ad Details {isBannerAd ? '(728×90)' : `(${dimensions.width}×${dimensions.height})`}</p>
              {[['title','Ad Title','text','Enter ad title'],['url','Target URL','url','https://your-website.com']].map(([field, label, type, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label} *</label>
                  <input type={type} value={formData[field]} onChange={(e) => setFormData(p => ({ ...p, [field]: e.target.value }))} placeholder={ph} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm" />
                  {errors[field] && <p className="text-red-500 text-xs mt-1.5">{errors[field]}</p>}
                </div>
              ))}
              {[['desktop','Desktop Image'],['mobile','Mobile Image']].map(([type, label]) => (
                <div key={type}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label} *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], type)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#329ae1]/10 file:text-[#329ae1] file:font-medium file:text-sm hover:file:bg-[#329ae1]/20 transition-colors" />
                  {uploadProgress[type] > 0 && uploadProgress[type] < 100 && (
                    <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#329ae1] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress[type]}%` }} />
                    </div>
                  )}
                  {errors[`${type}Image`] && <p className="text-red-500 text-xs mt-1.5">{errors[`${type}Image`]}</p>}
                  {formData[`${type}ImagePreview`] && <img src={formData[`${type}ImagePreview`]} alt="Preview" className="mt-3 rounded-xl border border-gray-100 max-h-32 object-contain shadow-sm" />}
                </div>
              ))}
              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#329ae1] focus:ring-[#329ae1]" />
                  <span className="text-sm text-gray-700">I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-[#329ae1] hover:underline font-medium">Terms and Conditions</button> *</span>
                </label>
                {errors.terms && <p className="text-red-500 text-xs mt-1.5 ml-7">{errors.terms}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => validateStep1() && setStep(2)} className="px-6 py-3 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium text-sm shadow-sm disabled:opacity-50" disabled={!formData.desktopImage || !formData.mobileImage || !termsAccepted}>Next: Preview →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-500">Step 2 of 3 — Preview</p>
              <div className="flex gap-3 justify-center">
                {[['desktop', Monitor, 'Desktop'],['mobile', Smartphone, 'Mobile']].map(([mode, Icon, label]) => (
                  <button key={mode} onClick={() => setPreviewMode(mode)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${previewMode === mode ? 'bg-[#329ae1] text-white shadow-md shadow-[#329ae1]/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {previewMode === 'desktop'
                  ? <DesktopPreview adType={adType} adImage={formData.desktopImagePreview} adUrl={formData.url} />
                  : <MobilePreview  adType={adType} adImage={formData.mobileImagePreview}  adUrl={formData.url} />}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm">← Back</button>
                <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium text-sm shadow-sm">Continue to Payment →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-500">Step 3 of 3 — Duration & Contact</p>
              <div className="space-y-3">
                {[
                  { val: '1',  label: '1 Day',           sub: 'Testing or short campaigns',   price: 'R 50',    orig: null,   save: null,   badge: null,             badgeColor: '' },
                  { val: '7',  label: '7 Days',           sub: 'Most popular',                 price: 'R 315',   orig: 'R350', save: 'R35',  badge: 'SAVE 10%',       badgeColor: 'bg-[#329ae1]' },
                  { val: '14', label: '14 Days',          sub: 'Extended reach',               price: 'R 595',   orig: 'R700', save: 'R105', badge: 'SAVE 15%',       badgeColor: 'bg-emerald-500' },
                  { val: '30', label: '30 Days',          sub: 'Maximum exposure',             price: 'R 1,200', orig: 'R1,500', save: 'R300', badge: 'BEST VALUE 20%', badgeColor: 'bg-amber-500' },
                ].map(({ val, label, sub, price, orig, save, badge, badgeColor }) => (
                  <label key={val} className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer relative transition-all duration-200 ${formData.duration === val ? 'border-[#329ae1] bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}>
                    {badge && <span className={`absolute -top-2.5 right-4 ${badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase`}>{badge}</span>}
                    <div className="flex items-center gap-3">
                      <input type="radio" name="duration" value={val} checked={formData.duration === val} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value, customDuration: '' }))} className="w-4 h-4 text-[#329ae1] border-gray-300 focus:ring-[#329ae1]" />
                      <div><p className="font-semibold text-gray-900 text-sm">{label}</p><p className="text-xs text-gray-500">{sub}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#329ae1]">{price}</p>
                      {orig && <p className="text-xs text-gray-400 line-through">{orig}</p>}
                      {save && <p className="text-xs text-emerald-600 font-medium">Save {save}</p>}
                    </div>
                  </label>
                ))}
                <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${formData.duration === 'custom' ? 'border-[#329ae1] bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="radio" name="duration" value="custom" checked={formData.duration === 'custom'} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} className="w-4 h-4 text-[#329ae1] border-gray-300 focus:ring-[#329ae1]" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Custom Duration</p>
                      {formData.duration === 'custom' && (
                        <div className="flex items-center gap-2 mt-2">
                          <input type="number" min="1" max="365" value={formData.customDuration} onChange={(e) => setFormData(p => ({ ...p, customDuration: e.target.value }))} placeholder="Days" className="w-24 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1]" />
                          <span className="text-sm text-gray-600">days</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.duration === 'custom' && formData.customDuration && (
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-[#329ae1]">R {calculatePrice().total.toFixed(0)}</p>
                      {calculatePrice().discount > 0 && <p className="text-xs text-emerald-600 font-medium">Save R {calculatePrice().discount.toFixed(0)}</p>}
                    </div>
                  )}
                </label>
              </div>
              {errors.duration && <p className="text-red-500 text-xs">{errors.duration}</p>}

              {/* Order summary */}
              {(formData.duration || formData.customDuration) && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-2xl p-5">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    {[['Ad Space', isBannerAd ? 'Banner' : adType.replace(/_/g, ' ').toUpperCase()], ['Duration', `${calculatePrice().days} day${calculatePrice().days !== 1 ? 's' : ''}`], ['Rate', 'R50/day']].map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-gray-500">{k}:</span><span className="font-medium text-gray-700">{v}</span></div>
                    ))}
                    {calculatePrice().discount > 0 && <>
                      <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="line-through text-gray-400">R {calculatePrice().subtotal.toFixed(0)}</span></div>
                      <div className="flex justify-between text-emerald-600"><span>Discount ({calculatePrice().discountPercentage}%):</span><span>-R {calculatePrice().discount.toFixed(0)}</span></div>
                    </>}
                    <div className="flex justify-between pt-3 border-t-2 border-blue-200/50">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-[#329ae1]">R {calculatePrice().total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Contact Information</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company Name (optional)</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Your company" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Email *</label>
                  <input type="email" value={formData.contactEmail} onChange={(e) => setFormData(p => ({ ...p, contactEmail: e.target.value }))} placeholder="contact@company.com" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-200 text-sm" />
                  {errors.contactEmail && <p className="text-red-500 text-xs mt-1.5">{errors.contactEmail}</p>}
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-5">
                <div className="flex gap-3">
                  <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <ul className="text-sm text-amber-800 list-disc list-inside space-y-1.5">
                    <li>Ad goes live within 24 hours of payment</li>
                    <li>Duration starts from activation date</li>
                    <li>Confirmation sent to your email</li>
                    <li>Secure payment powered by Stripe</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={loading || !formData.contactEmail} className="px-7 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm transition-all duration-300 text-sm">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} onAccept={() => { setTermsAccepted(true); setShowTerms(false); }} />
    </>
  );
}

// ─── Shared carousel navigation hook ────────────────────────────────────────

function useCarousel(total, perSlide, autoPlayMs = 0) {
  const [page, setPage]       = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [visible, setVisible] = useState(true);
  const timeoutRef            = useRef(null);
  const autoRef               = useRef(null);
  const totalPages            = Math.ceil(total / perSlide);

  const navigate = useCallback((dir) => {
    if (animDir) return;
    setAnimDir(dir);
    setVisible(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPage((p) => dir === 'right' ? (p + 1) % totalPages : (p - 1 + totalPages) % totalPages);
      setVisible(true);
      setAnimDir(null);
    }, 220);
  }, [animDir, totalPages]);

  // Auto-play
  useEffect(() => {
    if (!autoPlayMs || totalPages <= 1) return;
    autoRef.current = setInterval(() => navigate('right'), autoPlayMs);
    return () => clearInterval(autoRef.current);
  }, [autoPlayMs, totalPages, navigate]);

  useEffect(() => () => { clearTimeout(timeoutRef.current); clearInterval(autoRef.current); }, []);

  return { page, animDir, visible, totalPages, navigate };
}

// ─── Publisher Carousel (main grid — publishers WITH articles) ───────────────

const PUBLISHERS_PER_SLIDE = 10;

function PublisherCarousel({ sources, onSourceClick, onReadMoreClick }) {
  const { page, animDir, visible, totalPages, navigate } = useCarousel(sources.length, PUBLISHERS_PER_SLIDE);
  const slice = sources.slice(page * PUBLISHERS_PER_SLIDE, (page + 1) * PUBLISHERS_PER_SLIDE);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center">
            <Building className="w-4 h-4 text-[#329ae1]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Headlines</h2>
          <span className="text-sm text-gray-400">{sources.length} publisher{sources.length !== 1 ? 's' : ''}</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1.5 mr-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => { if (i !== page) navigate(i > page ? 'right' : 'left'); }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === page ? 'bg-[#329ae1] w-5' : 'w-2 bg-gray-200 hover:bg-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400 mr-1">{page + 1} / {totalPages}</span>
            {[['left', ChevronLeft], ['right', ChevronRight]].map(([dir, Icon]) => (
              <button key={dir} onClick={() => navigate(dir)} disabled={!!animDir}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow hover:scale-105 transition-all duration-200 disabled:opacity-40"
                aria-label={dir === 'left' ? 'Previous' : 'Next'}>
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ transition: visible ? 'opacity 0.22s ease, transform 0.22s ease' : 'none', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : animDir === 'right' ? 'translateX(-12px)' : 'translateX(12px)' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slice.map((source, idx) => (
          <Fragment key={source.id}>
            <PublisherCard source={source} onSourceClick={onSourceClick} onReadMoreClick={onReadMoreClick} />
            {((idx + 1) % 5 === 0) && (
              <div className="sm:col-span-2 lg:hidden">
                <AdSlot adType="mobile" width={320} height={50} className="w-full" onAdvertiseClick={() => {}} />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Single Publisher Card ───────────────────────────────────────────────────

function PublisherCard({ source, onSourceClick, onReadMoreClick }) {
  return (
    <Card
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => onSourceClick(source)}
    >
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-[#329ae1] transition-colors duration-200">
            {stripHtml(source.name)}
          </h3>
        </div>
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
            {source.logo ? (
              <img src={source.logo} alt={`${source.name} logo`} className="w-full h-full rounded-xl object-contain border border-gray-100 bg-white shadow-sm" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">{stripHtml(source.name).charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#329ae1] transition-colors duration-200">
              {source.recentStory?.title || 'No recent articles yet'}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-3 leading-relaxed">
              {source.recentStory?.excerpt || source.description || 'Publisher registered on PressPass.'}
            </p>
            {source.recentStory && (
              <button
                onClick={(e) => onReadMoreClick(e, source.recentStory.url)}
                className="text-xs text-[#329ae1] hover:text-[#2580c0] font-medium transition-colors duration-200"
              >
                Read more →
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span>Last post: {source.lastPosted}</span>
            {source.website && (
              <a href={source.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-[#329ae1] transition-colors duration-200">
                <ExternalLink className="w-3 h-3" />
                {source.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
          <PublisherFavoriteButton
            publisher={source}
            size="default"
            showText={false}
            className="p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main NewsGrid ───────────────────────────────────────────────────────────

export default function NewsGrid({ articles }) {
  const unique         = dedupeArticles(articles || []);
  const [newsources, setNewsources]     = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const [showAdModal, setShowAdModal]   = useState(false);
  const [selectedAdType, setSelectedAdType]         = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState({});
  const router = useRouter();

  // ── Payment success handler ──────────────────────────────────────────────
  const handlePaymentSuccess = useCallback(async () => {
    try {
      const params          = new URLSearchParams(window.location.search);
      const paymentIntentId = params.get('id');
      if (!paymentIntentId) throw new Error('Missing payment intent ID');

      let publisherId = null;
      let userEmail   = '';
      for (const key of ['user', 'currentUser', 'authUser', 'readerUser']) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          publisherId  = (parsed.originalUid || parsed.uid || '').replace(/^reader_/, '');
          userEmail    = parsed.email || '';
          if (publisherId) break;
        } catch { /* skip */ }
      }
      if (!publisherId) throw new Error('No publisher ID found. Please log in again.');

      const verifyRes  = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentIntentId }) });
      if (!verifyRes.ok) throw new Error(`Verification failed: ${verifyRes.status}`);
      const verifyData = await verifyRes.json();
      if (!verifyData.success || !verifyData.verified) throw new Error('Payment could not be verified');

      const pendingRaw = sessionStorage.getItem('pendingAdData');
      if (!pendingRaw) throw new Error('No pending ad data. Please try uploading again.');
      const pending    = JSON.parse(pendingRaw);

      const adData = {
        ...pending,
        status: 'active', approved: true,
        paymentIntentId: String(paymentIntentId),
        amount: Number(verifyData.amount),
        currency: String(verifyData.currency || 'ZAR'),
        paymentInfo: { paymentIntentId, amount: verifyData.amount, currency: verifyData.currency || 'ZAR', paidAt: new Date().toISOString(), stripeStatus: verifyData.stripeStatus || 'succeeded' },
        metadata: verifyData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publisherId: String(publisherId),
        publisherEmail: userEmail,
      };

      const res = await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adData) });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to create ad');

      sessionStorage.removeItem('pendingAdData');
      alert(`🎉 Ad Published!\n\nAd ID: ${result.id}\nAmount: ${adData.currency} ${adData.amount}\n\nYour ad is now live!`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      const id = new URLSearchParams(window.location.search).get('id');
      alert(`❌ Failed to Activate Ad\n\n${err.message}\n\nPayment ID: ${id}\nPlease contact support.`);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && params.get('id')) {
      handlePaymentSuccess();
    }
  }, [handlePaymentSuccess]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingSources(true);
        setSourcesError(null);
        const res  = await fetch('/api/news-sources');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (!data.success) throw new Error(data.error || 'Failed to fetch');
        setNewsources(data.newsources || []);
      } catch (err) {
        if (!cancelled) { console.error('[NewsGrid] fetch error:', err); setSourcesError(err.message); }
      } finally {
        if (!cancelled) setLoadingSources(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSourceClick   = (source) => router.push(`/news-reader/publisher/${source.id}`);
  const handleReadMoreClick = (e, url) => {
    e.stopPropagation();
    if (!url || url === '#') return;
    url.startsWith('/') ? router.push(url) : window.open(url, '_blank');
  };
  const handleAdvertiseClick = (adType, dimensions) => {
    setSelectedAdType(adType);
    setSelectedDimensions(dimensions);
    setShowAdModal(true);
  };

  return (
    <div className="relative bg-gray-50/60 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-4 sm:px-6 pb-10 pt-6 max-w-7xl mx-auto">

        {/* ── Main column ── */}
        <div className="space-y-8">
          {/* Banner ad */}
          <AdSlot adType="banner" isBanner className="w-full" onAdvertiseClick={() => handleAdvertiseClick('banner', { width: 728, height: 90 })} />

          {/* Publisher section */}
          <section className="mt-6">
            {sourcesError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-red-800 font-medium text-sm">Failed to load news sources</p>
                  <p className="text-red-600 text-xs mt-0.5">{sourcesError}</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 font-medium shadow-sm">Retry</button>
              </div>
            )}

            {loadingSources && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-6 w-36 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-4 w-20 bg-gray-100 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse rounded-2xl">
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2.5 pt-1">
                            <div className="h-3 bg-gray-200 rounded-lg w-3/4" />
                            <div className="h-2.5 bg-gray-100 rounded-lg w-full" />
                            <div className="h-2.5 bg-gray-100 rounded-lg w-2/3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!loadingSources && !sourcesError && newsources.filter(s => s.hasArticles).length > 0 && (
              <PublisherCarousel
                sources={newsources.filter(s => s.hasArticles)}
                onSourceClick={handleSourceClick}
                onReadMoreClick={handleReadMoreClick}
              />
            )}

            {!loadingSources && !sourcesError && newsources.filter(s => s.hasArticles).length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Building className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">No articles published yet</h3>
                <p className="text-sm text-gray-500 mt-1">Publishers will appear here once they post articles.</p>
              </div>
            )}
          </section>

          {/* Recommended */}
          <RecommendedOverlayBottom articles={unique} noArticlePublishers={newsources.filter(s => !s.hasArticles)} />
        </div>

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <AdSlot adType="sidebar_rectangle"  width={300} height={250} onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle',  { width: 300, height: 250 })} />
          <AdSlot adType="sidebar_skyscraper" width={300} height={600} onAdvertiseClick={() => handleAdvertiseClick('sidebar_skyscraper', { width: 300, height: 600 })} />
          <AdSlot adType="sidebar_rectangle2" width={300} height={250} onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle2', { width: 300, height: 250 })} />
        </aside>

      </div>

      <AdCreationModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        adType={selectedAdType}
        dimensions={selectedDimensions}
      />
    </div>
  );
}