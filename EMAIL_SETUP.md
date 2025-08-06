# Email Setup Guide for MediaHub

This guide explains how to set up email functionality for forgot password and welcome emails in the MediaHub application.

## Overview

The application now includes:
- **Forgot Password Email**: Sends password reset instructions when users request password reset
- **Welcome Email**: Automatically sent after successful user registration (both email and Google signup)

## Email Service Configuration

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_16_character_app_password

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- Use your Gmail address for `EMAIL_USER`
- Use the 16-character app password (not your regular Gmail password) for `EMAIL_APP_PASSWORD`
- Update `NEXT_PUBLIC_APP_URL` to your production domain when deploying

## Features Implemented

### 1. Forgot Password Functionality

**API Endpoint**: `/api/forgot-password`
- Validates user email exists in database
- Sends Firebase's built-in password reset email
- Handles both reader and publisher accounts
- Includes security measures to prevent email enumeration

**Frontend Updates**:
- Updated [`hooks/SignUpLogic.js`](hooks/SignUpLogic.js) with API integration
- Enhanced [`components/Authentication/ForgotPassword.jsx`](components/Authentication/ForgotPassword.jsx) with loading states and error handling
- Improved UI with better styling and user feedback

### 2. Welcome Email Functionality

**Automatic Sending**:
- Triggered after successful registration via [`/api/signup`](app/api/signup/route.js)
- Also sent for Google signups via [`/api/google-signup`](app/api/google-signup/route.js)
- Role-specific content for readers vs publishers
- Professional HTML email templates

**Email Content**:
- **Readers**: Welcome message with news reading features
- **Publishers**: Welcome message with publishing platform features
- Branded design with MediaHub logo and colors
- Call-to-action buttons directing to appropriate dashboards

## Email Templates

### Forgot Password Email
- Professional design with MediaHub branding
- Clear reset password button
- Security information (1-hour expiration)
- Fallback link for accessibility

### Welcome Email
- Role-specific content and features list
- Branded header with logo
- Feature highlights with checkmarks
- Call-to-action button to get started
- Professional footer

## Testing the Email Functionality

### 1. Test Forgot Password

1. Go to `/ForgotPassword`
2. Enter a registered email address
3. Click "Send Recovery Email"
4. Check the email inbox for password reset instructions

### 2. Test Welcome Email

1. Register a new account (either email or Google signup)
2. Check the email inbox for welcome message
3. Verify role-specific content is correct

### 3. Test Email Configuration

You can test the email configuration by creating a simple test endpoint:

```javascript
// app/api/test-email/route.js
import { testEmailConfiguration } from '../../../lib/emailService';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await testEmailConfiguration();
  return NextResponse.json(result);
}
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**:
   - Ensure 2FA is enabled on Gmail
   - Use App Password, not regular password
   - Check EMAIL_USER and EMAIL_APP_PASSWORD are correct

2. **Emails not sending**:
   - Verify environment variables are loaded
   - Check server logs for detailed error messages
   - Ensure Gmail account has sufficient sending limits

3. **Emails going to spam**:
   - Add your domain to SPF records
   - Consider using a dedicated email service for production
   - Test with different email providers

### Production Considerations

1. **Email Service**: Consider using dedicated services like:
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Domain Authentication**: Set up SPF, DKIM, and DMARC records

3. **Rate Limiting**: Implement rate limiting for password reset requests

4. **Email Templates**: Store templates in a database for easy updates

## File Structure

```
lib/
├── emailService.js          # Email service configuration and functions

app/api/
├── forgot-password/
│   └── route.js            # Forgot password API endpoint
├── signup/
│   └── route.js            # Updated with welcome email
└── google-signup/
    └── route.js            # Updated with welcome email

hooks/
└── SignUpLogic.js          # Updated forgot password logic

components/Authentication/
└── ForgotPassword.jsx      # Enhanced UI component

.env.example                # Environment variables template
```

## Security Features

1. **Email Enumeration Protection**: Returns success message even for non-existent emails
2. **Rate Limiting**: Firebase handles rate limiting for password reset emails
3. **Secure Token Generation**: Uses Firebase's secure password reset tokens
4. **Input Validation**: Validates email format and required fields
5. **Error Handling**: Comprehensive error handling with user-friendly messages

## Next Steps

1. Set up production email service
2. Configure domain authentication
3. Add email templates management
4. Implement email preferences for users
5. Add email analytics and tracking