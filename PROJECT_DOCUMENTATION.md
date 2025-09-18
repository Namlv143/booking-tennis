# Tennis Booking System - Complete Documentation

## 📋 **Project Overview**

This is a comprehensive **Next.js 14** tennis court booking system with automated scheduling, global state management, and CI/CD deployment. The system allows users to manually book tennis courts through a web interface and automatically books courts at 8:30 AM daily via Vercel cron jobs.

## 🏗️ **Architecture**

### **Frontend (Next.js 14)**
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom orange theme
- **State Management**: React Context API with global state
- **UI Components**: Radix UI components with custom styling
- **Icons**: Lucide React icons

### **Backend (API Routes)**
- **Authentication**: JWT token-based login system
- **API Integration**: Vinhomes tennis booking API
- **Automation**: Vercel cron jobs for scheduled booking
- **Error Handling**: Comprehensive error management

### **Deployment**
- **Platform**: Vercel with automatic deployments
- **CI/CD**: GitHub Actions for automated builds
- **Cron Jobs**: Vercel cron for scheduled tasks
- **Environment**: Production-ready with environment variables

## 📁 **Project Structure**

```
booking-tennis/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── cron/booking/         # Automated booking cron job
│   │   ├── login/                # User authentication
│   │   ├── tennis-booking/       # Manual booking endpoint
│   │   ├── test-booking/         # Testing endpoint
│   │   ├── user-me/              # User data retrieval
│   │   └── utility/              # Utilities API proxy
│   ├── login/                    # Login page
│   ├── utilities/                # Main dashboard
│   │   └── tennis/               # Tennis booking interface
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Home page (redirects to utilities)
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   └── theme-provider.tsx        # Theme context provider
├── lib/                          # Utility libraries
│   ├── context/                  # Global state management
│   │   └── app-context.tsx       # Main application context
│   ├── booking-config.ts         # Booking configuration
│   ├── token-service.ts          # Token management
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── scripts/                      # Python reference scripts
├── .github/workflows/            # CI/CD workflows
├── vercel.json                   # Vercel configuration
├── package.json                  # Dependencies and scripts
└── Documentation files
```

## 🎯 **Key Features**

### **1. User Authentication**
- **Login System**: Username/password authentication
- **Token Management**: JWT tokens stored in localStorage
- **Session Persistence**: Tokens persist across browser sessions
- **Auto-redirect**: Automatic routing based on auth state

### **2. Tennis Court Booking**
- **Manual Booking**: 5 different court/time slot combinations
- **Real-time Feedback**: Success/error messages for each booking
- **Loading States**: Visual feedback during booking process
- **Court Options**:
  - S1.01: 18h-20h, 20h-21h
  - S1.02: 18h-20h, 10h-12h, 20h-21h

### **3. Automated Booking (Cron Job)**
- **Schedule**: Daily at 8:30 AM (Vietnam timezone)
- **Target Courts**: S1.01 and S1.02 (18h-20h)
- **Precise Timing**: Waits until exact 8:30 AM
- **Simultaneous Booking**: Books both courts at once
- **Token-based**: Uses pre-stored token (no auto-login)

### **4. Global State Management**
- **Context API**: Centralized state management
- **User Data**: Accessible across all components
- **Loading States**: Consistent loading indicators
- **API Results**: Centralized result tracking
- **Error Handling**: Global error management

### **5. Utilities Dashboard**
- **Token Management**: Copy token for environment setup
- **Utility Data**: Fetch and display utility information
- **User Info**: Display logged-in user details
- **Navigation**: Easy access to booking interface

## 🔧 **Technical Implementation**

### **State Management (React Context)**

```typescript
// Global state structure
interface AppState {
  // Authentication
  isLoggedIn: boolean
  currentToken: string | null
  userData: UserData | null
  
  // Loading states
  isLoading: boolean
  isLoggingIn: boolean
  isBooking: boolean
  
  // API results
  loginResult: ApiResult | null
  utilityResult: ApiResult | null
  bookingResults: Record<string, BookingResult | null>
  
  // Error handling
  error: string | null
}
```

### **API Integration**

#### **Authentication Flow**
1. User enters credentials on `/login`
2. System calls `/api/login` with credentials
3. JWT token received and stored in localStorage
4. User data fetched via `/api/user-me`
5. Redirect to `/utilities` dashboard

#### **Booking Flow**
1. User clicks booking button on `/utilities/tennis`
2. System calls `/api/tennis-booking` with court parameters
3. Sequential API calls: time slots → classifies → places → ticket info → booking
4. Result displayed to user with success/error message

#### **Automated Booking Flow**
1. Vercel cron triggers `/api/cron/booking` at 8:30 AM
2. System retrieves token from `VINHOMES_TOKEN` environment variable
3. Executes booking for both target courts simultaneously
4. Logs results for monitoring

### **Configuration Management**

```typescript
// lib/booking-config.ts
export const BOOKING_CONFIG = {
  credentials: {
    username: '0979251496',
    password: 'Nam@2025'
  },
  timing: {
    cronSchedule: '30 8 * * *',  // 8:30 AM daily
    targetBookingTime: { hour: 8, minute: 30 }
  },
  api: {
    baseUrl: 'https://vh.vinhomes.vn',
    login: '/api/vhr/iam/v0/security/oauth-login',
    utilities: '/api/vhr/utility/v0/utility',
    booking: '/api/vhr/utility/v0/customer-utility/booking'
  },
  bookingPreferences: {
    card1: { placeId: 801, placeUtilityId: 625, timeConstraintId: 575 },
    card2: { placeId: 802, placeUtilityId: 626, timeConstraintId: 575 }
  }
}
```

## 🚀 **Deployment & CI/CD**

### **Vercel Configuration**
- **Framework**: Next.js with pnpm
- **Build Command**: `pnpm run build`
- **Install Command**: `pnpm install`
- **Region**: Singapore (sin1)
- **Cron Jobs**: Daily at 8:30 AM Vietnam time
- **API Timeout**: 300 seconds for cron jobs

### **GitHub Actions**
- **Triggers**: Push to main, pull requests
- **Steps**: Checkout → Setup Node.js → Install dependencies → Type check → Lint → Build → Deploy
- **Deployment**: Automatic to Vercel production/preview

### **Environment Variables**
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VINHOMES_TOKEN`: Pre-stored token for cron jobs

## 📱 **User Interface**

### **Design System**
- **Primary Color**: Orange (#f97316)
- **Background**: Orange gradient (from-orange-50 to-orange-100)
- **Components**: Radix UI with custom styling
- **Typography**: Geist Sans font family
- **Icons**: Lucide React icon library

### **Page Structure**

#### **Login Page (`/login`)**
- Username/password form
- Loading states during authentication
- Error/success message display
- Auto-redirect after successful login

#### **Utilities Dashboard (`/utilities`)**
- User information display
- Token management with copy functionality
- Utility data fetching
- Navigation to tennis booking
- Logout functionality

#### **Tennis Booking (`/utilities/tennis`)**
- 5 booking cards with different court/time combinations
- Real-time booking status
- Loading indicators during booking
- Success/error feedback
- Navigation back to dashboard

## 🔒 **Security & Authentication**

### **Token Management**
- **Storage**: localStorage (client-side)
- **Expiration**: No expiration (tokens persist indefinitely)
- **Security**: JWT tokens from Vinhomes API
- **Cleanup**: Manual logout clears all tokens

### **API Security**
- **Headers**: Mobile app simulation headers
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Built-in retry mechanisms
- **Error Handling**: Comprehensive error management

## 📊 **Monitoring & Logging**

### **Cron Job Monitoring**
- **Vercel Dashboard**: Function execution logs
- **Console Logs**: Detailed operation logging with `[CRON]` prefix
- **Error Tracking**: Comprehensive error logging
- **Success Metrics**: Booking success/failure tracking

### **Manual Testing**
- **Test Endpoint**: `/api/test-booking` for manual testing
- **Local Development**: `npm run dev` for local testing
- **Production Testing**: Direct API calls to production endpoints

## 🛠️ **Development**

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Deployment
npm run deploy       # Deploy to Vercel production
npm run deploy:preview # Deploy to Vercel preview

# Quality Assurance
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### **Dependencies**
- **Core**: Next.js 14, React 18, TypeScript
- **UI**: Radix UI, Tailwind CSS, Lucide React
- **State**: React Context API
- **Deployment**: Vercel CLI
- **Development**: ESLint, TypeScript

## 📈 **Performance & Optimization**

### **Code Splitting**
- **Route-based**: Automatic code splitting by Next.js
- **Component-based**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification

### **API Optimization**
- **Parallel Requests**: Simultaneous booking requests
- **Caching**: No-store cache policy for real-time data
- **Error Handling**: Retry mechanisms for failed requests
- **Timeout Management**: 300-second timeout for cron jobs

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] Email notifications for booking status
- [ ] Multiple court preferences
- [ ] Booking history tracking
- [ ] Web dashboard for monitoring
- [ ] Backup booking strategies
- [ ] User preferences management
- [ ] Mobile app development
- [ ] Real-time notifications

### **Technical Improvements**
- [ ] Database integration for data persistence
- [ ] Redis caching for improved performance
- [ ] WebSocket integration for real-time updates
- [ ] Advanced error monitoring
- [ ] Performance analytics
- [ ] A/B testing framework

## 📚 **Documentation Files**

1. **`README.md`** - Basic project information
2. **`AUTOMATED_BOOKING.md`** - Detailed cron job documentation
3. **`DEPLOYMENT.md`** - CI/CD setup and deployment guide
4. **`PROJECT_DOCUMENTATION.md`** - This comprehensive documentation

## 🎯 **Success Metrics**

The system is considered successful when:
- ✅ Users can successfully log in and book courts manually
- ✅ Cron job triggers at 8:30 AM daily
- ✅ Automated booking succeeds for both target courts
- ✅ All API integrations work correctly
- ✅ Error handling provides clear feedback
- ✅ State management works across all components
- ✅ Deployment pipeline functions without issues

## 🤝 **Support & Maintenance**

### **Troubleshooting**
1. **Check Vercel logs** for cron job execution
2. **Verify environment variables** are set correctly
3. **Test API endpoints** manually if issues occur
4. **Review GitHub Actions** for deployment problems
5. **Check browser console** for client-side errors

### **Maintenance Tasks**
- **Regular token updates** for cron job functionality
- **Monitor Vercel function logs** for errors
- **Update dependencies** regularly for security
- **Review and update documentation** as needed
- **Test booking functionality** periodically

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
