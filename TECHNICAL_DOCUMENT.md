# PressPass Technical Documentation

## Introduction

PressPass is a dual-interface media platform built with Next.js that serves two distinct user groups:
1. **News Readers** - Consumers who access local community news from various publishers
2. **Print Media Publishers** - Content creators who publish news and monetize their content through advertising

The platform aims to connect South African communities with hyper-local news while providing publishers with tools to manage their content and monetize their readership.

## Technology Stack

PressPass is built using a modern web technology stack:

- **Frontend Framework**: Next.js 15.3.5
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks
- **Authentication**: Firebase Authentication
- **Database**: Firestore (Firebase)
- **Storage**: Firebase Storage
- **Icons**: Lucide React, Font Awesome
- **Charts**: Recharts
- **Forms**: Custom form components
- **PDF Processing**: pdfjs-dist
- **Email Service**: Nodemailer
- **HTTP Client**: Axios

## Project Structure

```
PressPassDesktop/
├── app/                          # Next.js app directory with pages and API routes
│   ├── news-reader/             # News reader interface pages
│   ├── print-media/             # Publisher interface pages
│   ├── api/                     # API routes for backend functionality
│   ├── signin/                  # Authentication pages
│   ├── signup/                  # Registration pages
│   └── ...
├── components/                  # Reusable UI components
│   ├── news-reader/             # Components specific to news reader interface
│   ├── Print-mediaUI/           # Components specific to publisher interface
│   ├── UI/                      # Shared UI components
│   └── ...
├── Firebase/                    # Firebase configuration and initialization
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries and helper functions
└── public/                      # Static assets
```

## Architecture Overview

PressPass follows a client-server architecture with Next.js handling both frontend rendering and backend API routes:

1. **Frontend Layer**: 
   - Two distinct user interfaces (News Reader and Print Media)
   - Component-based UI architecture
   - Responsive design for desktop and mobile

2. **Backend Layer**:
   - Next.js API routes for server-side functionality
   - Firebase Admin SDK for privileged operations
   - Firebase Client SDK for frontend authentication

3. **Data Layer**:
   - Firestore for document-based data storage
   - Firebase Authentication for user management
   - Firebase Storage for file uploads

4. **Authentication Flow**:
   - Client-side authentication with Firebase
   - Server-side token verification for protected routes
   - Role-based access control (reader/publisher)

## Authentication System

PressPass implements a comprehensive authentication system using Firebase:

### Authentication Methods
- Email/password registration and sign-in
- Google Sign-In integration
- Forgot password functionality with email verification

### Implementation Details
- Client-side authentication using Firebase Client SDK
- Server-side token verification using Firebase Admin SDK
- Protected route implementation with Higher-Order Components (HOC)
- Local storage for user session data
- Role-based access control (reader vs publisher)

### Key Files
- [`lib/authHelpers.js`](lib/authHelpers.js) - Authentication helper functions
- [`Firebase/firebase.js`](Firebase/firebase.js) - Firebase client initialization
- [`lib/firebase-admin.js`](lib/firebase-admin.js) - Firebase admin initialization
- [`app/api/protected/route.js`](app/api/protected/route.js) - Protected API route example
- [`components/Authentication/`](components/Authentication/) - Authentication UI components

## Data Models

PressPass uses several key data models stored in Firestore:

### User Model
```javascript
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'reader' | 'publisher',
  profilePicture: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Publisher Model
```javascript
{
  uid: string,
  email: string,
  companyName: string,
  industry: string,
  companyWebsite: string,
  contactName: string,
  jobTitle: string,
  phone: string,
  publicationType: string,
  audienceType: string,
  monthlyReadership: number,
  companyDescription: string,
  address: string,
  foundedYear: string,
  employeeCount: number,
  profilePicture: string,
  companyLogo: string,
  staff: array,
  articlesCount: number,
  isActive: boolean,
  isVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Article/Story Model
```javascript
{
  headline: string,
  byline: string,
  location: string,
  section: string,
  edition: string,
  priority: 'normal' | 'high' | 'urgent',
  lead: string,
  body: string,
  pdfUrl: string,
  fileName: string,
  fileSize: number,
  previewStyle: string,
  action: 'draft' | 'review' | 'publish',
  status: 'draft' | 'published',
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp,
  title: string,
  description: string,
  creator: string,
  source_id: string,
  image_url: string,
  pubDate: timestamp,
  link: string,
  category: array
}
```

### Favorite Publications Model
```javascript
{
  userId: string,
  publisherId: string,
  addedAt: timestamp
}
```

## Firebase Integration

PressPass integrates with Firebase for authentication, data storage, and file management:

### Firebase Configuration
- Environment variables for Firebase configuration
- Separate client and admin SDK initialization
- Error handling for Firebase connection issues

### Firestore Implementation
- Collection-based data structure
- Queries with filtering and ordering
- Document creation, reading, and updating
- Security rules for data access control

### Firebase Storage
- PDF file uploads for articles
- Image storage for publisher logos
- File size and type validation

### Key Files
- [`Firebase/firebase.js`](Firebase/firebase.js) - Client SDK initialization
- [`lib/firebase-admin.js`](lib/firebase-admin.js) - Admin SDK initialization
- [`app/api/stories/route.js`](app/api/stories/route.js) - Stories API with Firestore integration
- [`app/api/publisher-profile/route.js`](app/api/publisher-profile/route.js) - Publisher profile management

## Services

PressPass implements several backend services through Next.js API routes:

### Authentication Services
- User sign-in/sign-up
- Google authentication
- Password reset
- Token verification

### Content Services
- Article creation and management
- Draft handling
- Content publishing
- News source management

### User Services
- Profile management
- Favorite publications tracking
- Publisher profile updates

### Monetization Services
- Wallet management
- Payment processing
- Ad submission handling

### Analytics Services
- Content analysis
- Subscriber tracking
- Advanced analytics

## Components and Pages

PressPass has a component-based architecture with distinct pages for each interface:

### News Reader Components
- News grid display
- Article preview cards
- Category filtering
- Search functionality
- Favorite buttons
- Ad slots

### Print Media Components
- Publisher dashboard
- Content management forms
- Analytics charts
- Wallet interface
- Ad monetization tools
- Subscriber management

### Shared Components
- Authentication forms
- Navigation headers
- Sidebars
- Buttons and UI elements

### Key Files
- [`components/news-reader/NewsGrid.jsx`](components/news-reader/NewsGrid.jsx) - News display component
- [`app/print-media/wallet/page.js`](app/print-media/wallet/page.js) - Publisher wallet interface
- [`app/print-media/subscribers/page.js`](app/print-media/subscribers/page.js) - Subscriber analytics
- [`app/news-reader/page.js`](app/news-reader/page.js) - News reader home page

## Navigation and Routing

PressPass implements distinct routing for each user interface:

### News Reader Routes
- `/news-reader` - Main news reader interface
- `/news-reader/article/[articleId]` - Individual article view
- `/news-reader/publisher/[publisherId]` - Publisher-specific articles
- `/news-reader/favorites` - User's favorite publications
- `/news-reader/search` - Search functionality

### Print Media Routes
- `/print-media` - Publisher dashboard
- `/print-media/overview` - Publisher overview
- `/print-media/content-analysis` - Content analytics
- `/print-media/journalist` - Journalist tools
- `/print-media/subscribers` - Subscriber management
- `/print-media/rss-feeds` - RSS feed management
- `/print-media/advanced-analytics` - Detailed analytics
- `/print-media/wallet` - Publisher wallet and payment system
- `/print-media/monetization` - Ad monetization tools

### Authentication Routes
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/forgot-password` - Password reset

## Guards

PressPass implements route protection using Higher-Order Components (HOC):

### Authentication Guards
- `withAuth` HOC for protecting pages
- Token verification in API routes
- Role-based access control
- Redirect to sign-in for unauthenticated users

### Implementation
- Client-side authentication status checking
- Server-side token verification
- Loading states during authentication checks
- Error handling for authentication failures

### Key Files
- [`lib/authHelpers.js`](lib/authHelpers.js) - Authentication helpers with HOC implementation

## Payment System

PressPass includes a comprehensive payment system for publishers:

### Features
- Wallet balance tracking
- Withdrawal management
- Payment method configuration
- Transaction history
- Earnings breakdown by source

### Implementation
- Integration with multiple payment providers (bank, mobile wallet, PayPal)
- Withdrawal amount validation
- Transaction recording in Firestore
- Payment status tracking

### Key Files
- [`app/print-media/wallet/page.js`](app/print-media/wallet/page.js) - Wallet interface
- [`app/print-media/monetization/page.js`](app/print-media/monetization/page.js) - Monetization tools

## Firebase Cloud Functions

While not directly visible in the provided codebase, PressPass would benefit from Firebase Cloud Functions for:

### Recommended Functions
- User registration triggers
- Article publishing notifications
- Payment processing
- RSS feed generation
- Analytics data aggregation
- Email sending for password resets

### Implementation Considerations
- Server-side validation of data
- Automated email notifications
- Scheduled tasks for analytics
- Image processing for uploaded content

## Subscription System

PressPass implements a subscription system for news readers to follow publishers:

### Features
- Favorite publisher tracking
- Publisher-specific news feeds
- Subscription management
- News source discovery

### Implementation
- User-publisher relationship storage
- API routes for managing favorites
- UI components for favorite toggling
- Publisher listing with article previews

### Key Files
- [`components/PublisherFavoriteButton.jsx`](components/PublisherFavoriteButton.jsx) - Favorite toggle button
- [`app/api/favorites/`](app/api/favorites/) - Favorites API routes

## Extending the Application

PressPass can be extended in several ways:

### Adding New Content Types
1. Create new data models in Firestore
2. Implement API routes for new content
3. Develop UI components for content display
4. Add navigation routes for new features

### Adding New Payment Methods
1. Extend payment method options in wallet component
2. Implement new payment processing logic
3. Add payment provider integration
4. Update transaction history display

### Adding New Analytics Features
1. Extend data models with new metrics
2. Implement additional API routes
3. Create new chart components
4. Add analytics pages

### Adding New Publisher Tools
1. Create new API routes for functionality
2. Develop UI components
3. Add navigation menu items
4. Implement business logic

## Common Patterns and Best Practices

PressPass follows several common patterns and best practices:

### Component Patterns
- Reusable UI components with props
- Client-side hooks for data fetching
- Loading states for async operations
- Error handling in components

### API Route Patterns
- Consistent response formats
- Error handling with appropriate status codes
- Authentication token verification
- Data validation before processing

### Data Management
- Centralized Firebase initialization
- Separation of client and admin SDK usage
- Consistent data model structures
- Timestamp management for content

### Security
- Protected routes with authentication checks
- Server-side data validation
- Environment variable configuration
- Role-based access control

## Troubleshooting

### Common Issues

#### Firebase Connection Problems
- Verify environment variables are set correctly
- Check Firebase project configuration
- Ensure service account credentials are valid
- Test Firestore permissions with provided utilities

#### Authentication Failures
- Check if user exists in Firebase Authentication
- Verify token expiration and validity
- Ensure proper redirect handling
- Check localStorage for user data

#### Content Not Displaying
- Verify Firestore document structure
- Check API route response formats
- Ensure proper category filtering
- Validate document permissions

#### Payment Processing Issues
- Verify payment method configuration
- Check transaction history in Firestore
- Ensure proper amount validation
- Test different payment provider integrations

### Debugging Tools
- Console logging in components and API routes
- Firebase console for database inspection
- Network tab for API request monitoring
- Error boundaries for component error handling