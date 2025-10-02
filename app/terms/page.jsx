export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4 text-sm text-gray-600">Effective Date: [2025]</p>

      <div className="prose text-gray-800">
        <h2>1. Eligibility</h2>
        <p>You must be at least 13 years old (or the minimum age required in your country) to use our App. If you are under 18, you confirm you have parental/guardian consent.</p>

        <h2>2. User Accounts</h2>
        <p>You may need to create an account to access certain features. You are responsible for keeping your login credentials secure and agree not to impersonate others or provide false information.</p>

        <h2>3. Acceptable Use</h2>
        <p>You agree not to use the App for unlawful purposes, attempt unauthorized access, or interfere with others’ experience.</p>

        <h2>4. Content</h2>
        <p>
          You retain ownership of content you share but grant us a limited license to operate and improve the App. You may not share offensive, harmful, or illegal content.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>All rights to the App, including software, design, and trademarks (excluding user content), are owned by [Your App Name].</p>

        <h2>6. Payment & Subscriptions (if applicable)</h2>
        <p>Some features may require payment. Fees, billing, and refund policies will be disclosed before purchase.</p>

        <h2>7. Termination</h2>
        <p>We may suspend or terminate your account if you violate these Terms. You may stop using the App anytime.</p>

        <h2>8. Disclaimers & Limitation of Liability</h2>
        <p>The App is provided “as is.” We are not responsible for damages, losses, or issues arising from use of the App.</p>

        <h2>9. Governing Law</h2>
        <p>These Terms are governed by the laws of [Your Country/Region].</p>

        <h2>10. Changes to Terms</h2>
        <p>We may update these Terms at any time. Continued use of the App means you accept the revised Terms.</p>

        <h2>11. Contact Us</h2>
        <p>If you have questions, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
      </div>

      <a 
  href="/docs/terms.pdf" 
  download="terms.pdf" 
  className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
>
  Download Terms as PDF
</a>

    </div>
  );
}
