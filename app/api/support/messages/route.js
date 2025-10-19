
// app/api/support/send-message/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getStorage } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const email = formData.get('email');
    const userId = formData.get('userId');
    const userName = formData.get('userName');
    const file = formData.get('file');

    if (!message && !file) {
      return NextResponse.json(
        { error: 'Message or file is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    
    // Generate ticket ID
    const ticketNumber = `T-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Handle file upload if present
    let fileUrl = null;
    let fileName = null;
    
    if (file) {
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
      
      // Make file publicly accessible
      await fileUpload.makePublic();
      fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      fileName = file.name;
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
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

    const ticketRef = await db.collection('support-tickets').add(ticketData);

    // Trigger email notification to admin (using Firebase Extension)
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
          <p><a href="${process.env.ADMIN_DASHBOARD_URL || 'https://admin.yourdomain.com'}/tickets/${ticketRef.id}">View Ticket</a></p>
        `,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticketNumber,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}