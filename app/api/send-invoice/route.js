// app/api/send-invoice/route.js
import { NextResponse } from 'next/server';
import { sendInvoiceEmail, generateInvoiceNumber } from '@/lib/emailInvoice';

export async function POST(request) {
  console.log('📧 POST /api/send-invoice - Sending invoice email...');
  
  try {
    const body = await request.json();
    
    const {
      email,
      company,
      paymentIntentId,
      amount,
      currency,
      adDetails,
      publisherId
    } = body;

    // Validate required fields
    if (!email || !paymentIntentId || !amount) {
      console.error('❌ Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, paymentIntentId, amount'
      }, { status: 400 });
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    
    // Format payment date
    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create management link
    const managementLink = `${process.env.NEXT_PUBLIC_APP_URL}/manage-ads?publisherId=${publisherId || ''}`;

    // Prepare invoice data
    const invoiceData = {
      email,
      company: company || 'Valued Customer',
      paymentIntentId,
      amount,
      currency: currency || 'ZAR',
      adDetails: adDetails || {},
      managementLink,
      invoiceNumber,
      paymentDate
    };

    console.log('📨 Sending invoice to:', email);
    
    // Send invoice email
    const result = await sendInvoiceEmail(invoiceData);

    console.log('✅ Invoice email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
      invoiceNumber,
      messageId: result.messageId
    });

  } catch (error) {
    console.error('🚨 Error sending invoice:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send invoice email'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';