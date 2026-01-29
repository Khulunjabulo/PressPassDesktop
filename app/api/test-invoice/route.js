// Create a test route: app/api/test-invoice/route.js
import { sendInvoiceEmail, generateInvoiceNumber } from '@/lib/emailInvoice';

export async function GET() {
  const testData = {
    email: 'test@example.com',
    company: 'Test Company',
    paymentIntentId: 'pi_test_12345',
    amount: 100,
    currency: 'ZAR',
    adDetails: {
      templateName: 'Banner Ad',
      deviceType: 'Desktop',
      dimensions: '728x90',
      duration: 30,
      durationUnit: 'days'
    },
    managementLink: 'http://localhost:3000/manage-ads',
    invoiceNumber: generateInvoiceNumber(),
    paymentDate: new Date().toLocaleDateString()
  };
  
  await sendInvoiceEmail(testData);
  return new Response('Test email sent!');
}