
import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, 
    },
  });
};

// Send forgot password email
export const sendForgotPasswordEmail = async (email, resetLink) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"MediaHub Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your MediaHub Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #329ae1, #67a2c9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #329ae1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { width: 60px; height: 60px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://your-domain.com/Presspass.png" alt="MediaHub" class="logo">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We received a request to reset your MediaHub account password. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #329ae1;">${resetLink}</p>
          </div>
          <div class="footer">
            <p>© 2024 MediaHub. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Forgot password email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Error sending forgot password email:', error);
    throw error;
  }
};

// Send welcome email after registration
export const sendWelcomeEmail = async (email, firstName, role) => {
  const transporter = createTransporter();
  
  const roleSpecificContent = role === 'reader' 
    ? {
        title: 'Welcome to MediaHub News Reader!',
        description: 'Start exploring news from trusted publishers worldwide.',
        features: [
          'Browse news by categories',
          'Bookmark your favorite articles',
          'Follow publishers you trust',
          'Get personalized recommendations'
        ],
        ctaText: 'Start Reading News',
        ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/news-reader`
      }
    : {
        title: 'Welcome to MediaHub Publisher Platform!',
        description: 'Start publishing and reach millions of readers worldwide.',
        features: [
          'Publish articles and stories',
          'Track your readership analytics',
          'Manage your publication profile',
          'Monetize your content'
        ],
        ctaText: 'Start Publishing',
        ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/print-media/overview`
      };

  const mailOptions = {
    from: `"MediaHub Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${roleSpecificContent.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MediaHub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #329ae1, #67a2c9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #329ae1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; }
          .feature-item:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { width: 60px; height: 60px; margin-bottom: 10px; }
          .checkmark { color: #329ae1; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://your-domain.com/Presspass.png" alt="MediaHub" class="logo">
            <h1>${roleSpecificContent.title}</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${firstName}! </h2>
            <p>Thank you for joining MediaHub! ${roleSpecificContent.description}</p>
            
            <div class="features">
              <h3>What you can do:</h3>
              ${roleSpecificContent.features.map(feature => 
                `<div class="feature-item"><span class="checkmark">✓</span>${feature}</div>`
              ).join('')}
            </div>
            
            <div style="text-align: center;">
              <a href="${roleSpecificContent.ctaLink}" class="button">${roleSpecificContent.ctaText}</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy ${role === 'reader' ? 'reading' : 'publishing'}!</p>
            <p><strong>The MediaHub Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 MediaHub. All rights reserved.</p>
            <p>You're receiving this email because you signed up for a MediaHub account.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Error sending welcome email:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log(' Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error(' Email configuration error:', error);
    return { success: false, error: error.message };
  }
};