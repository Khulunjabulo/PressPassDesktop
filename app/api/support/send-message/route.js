// app/api/support/send-message/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getStorage } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    ('📨 Send message endpoint hit');
    
    const formData = await request.formData();
    const message = formData.get('message');
    const email = formData.get('email');
    const userId = formData.get('userId');
    const userName = formData.get('userName');
    const file = formData.get('file');

    ('📝 Received data:', { message, email, userId, userName, hasFile: !!file });

    // Validation
    if (!message && !file) {
      console.error('❌ No message or file provided');
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 }
      );
    }

    if (!email) {
      console.error('❌ No email provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    ('✅ Validation passed');

    const db = getFirestoreDb();
    
    // Generate ticket ID
    const ticketNumber = `T-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    ('🎫 Generated ticket ID:', ticketNumber);
    
    // Handle file upload if present
    let fileUrl = null;
    let fileName = null;
    
    if (file) {
      try {
        ('📎 Processing file upload...');
        const storage = getStorage();
        const bucket = storage.bucket();
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const filePath = `support-files/${userId}/${Date.now()}-${file.name}`;
        
        const fileUpload = bucket.file(filePath);
        await fileUpload.save(fileBuffer, {
          metadata: {
            contentType: file.type,
          },
        });
        
        await fileUpload.makePublic();
        fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        fileName = file.name;
        ('✅ File uploaded:', fileName);
      } catch (fileError) {
        console.error('❌ File upload error:', fileError);
        // Continue without file if upload fails
      }
    }

    // Create ticket document
    const ticketData = {
      ticketId: ticketNumber,
      subject: message ? message.substring(0, 100) : 'File attachment',
      customer: email,
      userId: userId,
      userName: userName,
      priority: 'MEDIUM',
      status: 'Open',
      assigned: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isExpired: false,
      isArchived: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          message: message || '',
          timestamp: new Date().toISOString(),
          fromUser: true,
          fromAdmin: false,
          senderName: userName,
          senderEmail: email,
          fileUrl: fileUrl,
          fileName: fileName,
        }
      ]
    };

    ('💾 Saving ticket to Firestore...');
    const ticketRef = await db.collection('support-tickets').add(ticketData);
    ('✅ Ticket saved with ID:', ticketRef.id);

    // Send email notification to admin
    try {
      ('📧 Sending email notification...');
      await db.collection('mail').add({
        to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
        message: {
          subject: `New Support Ticket: ${ticketNumber}`,
          html: `
            <h2>New Support Ticket Received</h2>
            <p><strong>Ticket ID:</strong> ${ticketNumber}</p>
            <p><strong>From:</strong> ${userName} (${email})</p>
            <p><strong>Message:</strong></p>
            <p>${message || 'File attachment only'}</p>
            ${fileName ? `<p><strong>Attachment:</strong> ${fileName}</p>` : ''}
            <p><a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000'}/support-tickets">View Ticket</a></p>
          `,
        },
      });
      ('✅ Email queued');
    } catch (emailError) {
      console.error('⚠️ Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    ('🎉 Request completed successfully');
    return NextResponse.json({
      success: true,
      ticketId: ticketNumber,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to send message', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}