export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-600">Effective Date: [2025]</p>

      <div className="prose text-gray-800">
        <h2>1. Information We Collect</h2>
        <p>We may collect personal info (name, email), usage data (device info, IP), and optional data (content you upload).</p>

        <h2>2. How We Use Information</h2>
        <p>We use your data to provide and improve the App, personalize your experience, send updates, and ensure security.</p>

        <h2>3. Sharing of Information</h2>
        <p>We do not sell your data. We may share info with service providers, if required by law, or to protect users and the company.</p>

        <h2>4. Data Security</h2>
        <p>We use industry-standard measures but cannot guarantee 100% security.</p>

        <h2>5. Your Rights</h2>
        <p>You may have rights to access, update, or delete your data, depending on your location.</p>

        <h2>6. Children’s Privacy</h2>
        <p>We do not knowingly collect data from children under 13. Parents may request deletion of their child’s data.</p>

        <h2>7. Third-Party Services</h2>
        <p>Our App may link to third-party tools. Their policies govern their data practices.</p>

        <h2>8. Data Retention</h2>
        <p>We retain data as long as necessary to provide services, comply with legal duties, and resolve disputes.</p>

        <h2>9. Changes to This Policy</h2>
        <p>We may update this policy. Continued use of the App means acceptance of changes.</p>

        <h2>10. Contact Us</h2>
        <p>If you have questions, contact us at <a href="mailto:privacy@yourapp.com">privacy@yourapp.com</a>.</p>
      </div>

     <a 
  href="/docs/privacy.pdf" 
  download="privacy.pdf" 
  className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
>
  Download Privacy Policy as PDF
</a>
    </div>
  );
}
