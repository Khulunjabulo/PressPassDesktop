import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {
  const [hasReadWarning, setHasReadWarning] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (!hasReadWarning) {
      alert('Please confirm that you have read the terms and conditions');
      return;
    }
    onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Advertising Terms and Conditions</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6 text-gray-700">
            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    Please read these terms carefully before uploading your advertisement. 
                    By checking the confirmation box below, you agree to comply with all terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: General Terms */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. General Advertising Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>All advertisements must comply with applicable laws and regulations in South Africa.</li>
                <li>Advertisers are responsible for ensuring their ads do not infringe on any intellectual property rights.</li>
                <li>PressPass reserves the right to reject or remove any advertisement at any time without prior notice.</li>
                <li>All ad content must be accurate and not misleading to readers.</li>
                <li>Advertisements must not contain malware, viruses, or malicious code.</li>
              </ul>
            </section>

            {/* Section 2: Content Guidelines */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Content Guidelines</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Advertisements must not promote illegal activities, products, or services.</li>
                <li>Ads must not contain hate speech, discrimination, or harassment of any kind.</li>
                <li>Political advertisements must be clearly labeled and comply with electoral regulations.</li>
                <li>Advertisements for alcohol, tobacco, or gambling must comply with relevant advertising codes.</li>
                <li>Medical and health claims must be substantiated and comply with advertising standards.</li>
              </ul>
            </section>

            {/* Section 3: Adult Content Policy */}
            <section className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">3. Adult Content Policy (18+)</h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-red-800">
                  If your advertisement contains adult content, nudity, or sexually suggestive material, the following applies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-red-800">
                  <li><strong>Content must be tasteful and respectful</strong> - No explicit sexual content or pornographic material.</li>
                  <li><strong>Age-restricted placement</strong> - Adult content ads will only be displayed in appropriate sections.</li>
                  <li><strong>Clear labeling required</strong> - Ads must be clearly marked as containing adult content.</li>
                  <li><strong>Nudity guidelines</strong> - Artistic nudity is permitted if presented in a non-exploitative, respectful manner.</li>
                  <li><strong>No exploitation</strong> - Content must not exploit, objectify, or demean individuals.</li>
                  <li><strong>Compliance required</strong> - All adult content must comply with the Films and Publications Act.</li>
                </ul>
                <p className="font-medium text-red-800 mt-3">
                  ⚠️ Violation of adult content policies will result in immediate removal and potential account suspension.
                </p>
              </div>
            </section>

            {/* Section 4: Image Requirements */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Image Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Images must be high quality and appropriate for the selected ad size.</li>
                <li>Maximum file size: 5MB per image.</li>
                <li>Supported formats: JPG, PNG, GIF (non-animated).</li>
                <li>Images must not contain excessive text (recommended maximum: 20% of image area).</li>
                <li>Images must be original or properly licensed for commercial use.</li>
              </ul>
            </section>

            {/* Section 5: Prohibited Content */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Prohibited Content</h3>
              <p className="text-sm mb-2">Advertisements must NOT contain:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>False, misleading, or deceptive claims</li>
                <li>Counterfeit goods or pirated content</li>
                <li>Weapons, explosives, or ammunition</li>
                <li>Illegal drugs or drug paraphernalia</li>
                <li>Content promoting violence, self-harm, or dangerous activities</li>
                <li>Discriminatory content based on race, religion, gender, sexual orientation, or disability</li>
                <li>Child exploitation or content targeting minors inappropriately</li>
                <li>Phishing, scams, or fraudulent schemes</li>
              </ul>
            </section>

            {/* Section 6: Payment and Billing */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Payment and Billing</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>All advertisements are published on a prepaid basis unless otherwise agreed.</li>
                <li>Ad pricing is based on size, placement, and duration as per current rate card.</li>
                <li>No refunds will be issued for completed ad campaigns.</li>
                <li>PressPass reserves the right to modify pricing with 30 days notice.</li>
              </ul>
            </section>

            {/* Section 7: Liability and Indemnification */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Liability and Indemnification</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Advertisers indemnify PressPass against any claims arising from advertisement content.</li>
                <li>PressPass is not responsible for click-through rates or conversion performance.</li>
                <li>Technical issues affecting ad display will be addressed promptly but do not entitle refunds.</li>
                <li>Advertisers are solely responsible for landing page content and functionality.</li>
              </ul>
            </section>

            {/* Section 8: Modifications */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Modifications to Terms</h3>
              <p className="text-sm">
                PressPass reserves the right to modify these terms at any time. Continued use of advertising services 
                after changes constitutes acceptance of modified terms. Major changes will be communicated via email 
                to registered advertisers.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Us</h3>
              <p className="text-sm text-blue-800">
                For questions about advertising policies or to report inappropriate content:
              </p>
              <p className="text-sm text-blue-900 font-medium mt-2">
                Email: Partners@presspass.africa<br />
                Phone: +27 87 XXX XXX
              </p>
            </section>
          </div>
        </div>

        {/* Footer with Checkbox */}
        <div className="border-t p-6 bg-gray-50 sticky bottom-0 rounded-b-lg">
          <div className="flex items-start space-x-3 mb-4">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={hasReadWarning}
              onChange={(e) => setHasReadWarning(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-gray-700 cursor-pointer select-none">
              <span className="font-semibold">I confirm that I have read and agree to these Terms and Conditions.</span>
              <br />
              <span className="text-xs text-gray-600">
                I understand that my advertisement must comply with all policies, including adult content guidelines 
                if applicable, and that violations may result in removal and account suspension.
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasReadWarning}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                hasReadWarning
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}