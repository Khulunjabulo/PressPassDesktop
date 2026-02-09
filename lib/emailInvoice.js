import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Send invoice email after successful payment
export const sendInvoiceEmail = async (invoiceData) => {
  const transporter = createTransporter();
  
  const {
    email,
    company,
    paymentIntentId,
    amount,
    currency,
    adDetails,
    managementLink,
    invoiceNumber,
    paymentDate
  } = invoiceData;

  const mailOptions = {
    from: `"PressPass Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invoice #${invoiceNumber} - Advertisement Payment Confirmation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - Advertisement Payment</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 650px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #329ae1, #67a2c9); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .logo { 
            width: 70px; 
            height: 70px; 
            margin-bottom: 15px; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px;
          }
          .invoice-header {
            border-bottom: 2px solid #329ae1;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .invoice-header h2 {
            margin: 0 0 10px 0;
            color: #329ae1;
            font-size: 24px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .invoice-info-block {
            margin-bottom: 15px;
          }
          .invoice-info-block h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invoice-info-block p {
            margin: 2px 0;
            font-size: 15px;
            color: #333;
          }
          .ad-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
          }
          .ad-details h3 {
            margin: 0 0 20px 0;
            color: #329ae1;
            font-size: 18px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #555;
          }
          .detail-value {
            color: #333;
            text-align: right;
          }
          .payment-summary {
            background: #e8f4fd;
            border-left: 4px solid #329ae1;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 15px;
          }
          .payment-row.total {
            border-top: 2px solid #329ae1;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #329ae1;
          }
          .button { 
            display: inline-block; 
            background: #329ae1; 
            color: white !important; 
            padding: 14px 35px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            transition: background 0.3s;
          }
          .button:hover {
            background: #2780c0;
          }
          .cta-section {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 30px 0;
          }
          .cta-section h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
          }
          .cta-section p {
            margin: 0 0 20px 0;
            color: #666;
          }
          .info-box {
            background: #fff9e6;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 0;
            font-size: 14px;
            color: #856404;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #666; 
            font-size: 14px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer a {
            color: #329ae1;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          .payment-id {
            font-family: 'Courier New', monospace;
            background: #f1f3f5;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            word-break: break-all;
          }
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .content {
              padding: 20px 15px;
            }
            .header {
              padding: 30px 15px;
            }
            .invoice-info {
              flex-direction: column;
            }
            .detail-row {
              flex-direction: column;
            }
            .detail-value {
              text-align: left;
              margin-top: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Presspass.png" alt="PressPass" class="logo">
            <h1>Payment Successful</h1>
            <p>Thank you for advertising with PressPass</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Invoice Header -->
            <div class="invoice-header">
              <h2>Invoice #${invoiceNumber}</h2>
              <p style="color: #666; margin: 5px 0;">Payment Date: ${paymentDate}</p>
            </div>

            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="invoice-info-block">
                <h3>Bill To</h3>
                <p><strong>${company || 'N/A'}</strong></p>
                <p>${email}</p>
              </div>
              <div class="invoice-info-block">
                <h3>Payment ID</h3>
                <p class="payment-id">${paymentIntentId}</p>
              </div>
            </div>

            <h3 style="margin-bottom: 20px; color: #333;">Hello${company ? ' ' + company : ''}!</h3>
            <p style="margin-bottom: 20px;">Your advertisement payment has been successfully processed. Your ad is now live and running on PressPass.</p>
            
            <!-- Advertisement Details -->
            <div class="ad-details">
              <h3>📢 Advertisement Details</h3>
              <div class="detail-row">
                <span class="detail-label">Template Name:</span>
                <span class="detail-value">${adDetails.templateName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Device Type:</span>
                <span class="detail-value">${adDetails.deviceType || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Dimensions:</span>
                <span class="detail-value">${adDetails.dimensions || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${adDetails.duration || 'N/A'} ${adDetails.durationUnit || 'days'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date:</span>
                <span class="detail-value">${adDetails.startDate || paymentDate}</span>
              </div>
              ${adDetails.endDate ? `
              <div class="detail-row">
                <span class="detail-label">End Date:</span>
                <span class="detail-value">${adDetails.endDate}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #28a745; font-weight: 600;">✓ Active</span>
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="payment-row">
                <span>Advertisement Fee:</span>
                <span>${currency} ${amount}</span>
              </div>
              <div class="payment-row total">
                <span>Total Paid:</span>
                <span>${currency} ${amount}</span>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
              <h3>🎯 Manage Your Advertisement</h3>
              <p>Track performance, extend duration, or update your ad</p>
              <a href="${managementLink}" class="button">Manage My Ad</a>
            </div>

            <!-- Info Box -->
            <div class="info-box">
              <p><strong>💡 Note:</strong> You can extend your ad duration at any time by clicking the "Manage My Ad" button above. Additional days can be purchased through your ad management dashboard.</p>
            </div>

            <p style="margin-top: 30px;">If you have any questions about your advertisement or invoice, please don't hesitate to contact our support team.</p>
            
            <p style="margin-top: 20px;"><strong>Thank you for choosing PressPass!</strong></p>
            <p style="color: #666;">The PressPass Team</p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Presspass</strong></p>
            <p>© ${new Date().getFullYear()} Presspass. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit Website</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Support</a> | 
              <a href="${managementLink}">Manage Ads</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              This is an automated invoice email. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    ('✅ Invoice email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    throw error;
  }
};

// Generate invoice number
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};