
import { NextResponse } from 'next/server';
import { testEmailConfiguration, sendWelcomeEmail } from '../../../lib/emailService';

export async function GET() {
  (' Testing email configuration...');
  
  try {
    const result = await testEmailConfiguration();
    
    if (result.success) {
      (' Email configuration test passed');
      return NextResponse.json({
        success: true,
        message: 'Email configuration is valid and ready to use.',
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(' Email configuration test failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Email configuration test failed. Please check your environment variables.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error(' Error testing email configuration:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to test email configuration.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  (' Testing email sending...');
  
  try {
    const body = await request.json();
    const { email, firstName, role } = body;
    
    // Validate input
    if (!email || !firstName || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, role',
      }, { status: 400 });
    }
    
    if (!['reader', 'publisher'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Must be either "reader" or "publisher"',
      }, { status: 400 });
    }
    
    (`Sending test welcome email to ${email} as ${role}...`);
    
    // Send test welcome email
    const result = await sendWelcomeEmail(email, firstName, role);
    
    ('Test email sent successfully:', result.messageId);
    
    return NextResponse.json({
      success: true,
      message: `Test welcome email sent successfully to ${email}`,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to send test email.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}