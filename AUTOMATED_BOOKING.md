# Automated Tennis Booking System

This system automatically books tennis courts at 8:30 AM every day using a precise cron job that runs at 8:25 AM.

## 🕐 **Schedule**

- **8:25 AM**: Cron job triggers
  - Logout from any existing session
  - Login with credentials (0979251496/Nam@2025) - **exactly like manual login**
  - Call utilities API to get available data - **exactly like handleGetUtility**
- **8:30 AM**: Precise timing trigger
  - Execute booking flow for **Card 1: S1.01 18h-20h** (placeId: 801, placeUtilityId: 625, timeConstraintId: 575)
  - Execute booking flow for **Card 2: S1.02 18h-20h** (placeId: 802, placeUtilityId: 626, timeConstraintId: 575)
  - Submit both booking requests simultaneously

## 🔧 **Configuration**

### **Cron Schedule**
- **Vercel Cron**: `25 8 * * *` (8:25 AM every day)
- **Timezone**: Asia/Ho_Chi_Minh (Vietnam time)

### **Credentials**
- **Username**: 0979251496
- **Password**: Nam@2025

### **API Endpoints**
- **Base URL**: https://vh.vinhomes.vn
- **Login**: `/api/vhr/iam/v0/security/oauth-login` (exactly like manual login)
- **Utilities**: `/api/vhr/utility/v0/utility` (exactly like handleGetUtility)
- **Booking**: `/api/vhr/utility/v0/customer-utility/booking` (exactly like manual booking buttons)

## 📁 **Files Structure**

```
app/api/
├── cron/booking/route.ts          # Main cron job handler
├── test-booking/route.ts          # Manual test endpoint
└── utility/route.ts               # Utilities API proxy

lib/
└── booking-config.ts              # Configuration and helpers

vercel.json                        # Vercel cron configuration
```

## 🚀 **How It Works**

### **1. Cron Job Trigger (8:25 AM)**
```typescript
// Vercel automatically calls this endpoint at 8:25 AM
GET /api/cron/booking
```

### **2. Authentication Flow**
```typescript
// Step 1: Logout (if needed)
await this.logout()

// Step 2: Login with credentials
const loginResult = await this.performLogin()
```

### **3. Utilities Check**
```typescript
// Step 3: Get utilities data
const utilitiesResult = await this.getUtilities(token)
```

### **4. Precise Timing Wait**
```typescript
// Step 4: Wait until exactly 8:30 AM
const waitTime = getWaitTimeUntilBooking()
await new Promise(resolve => setTimeout(resolve, waitTime))
```

### **5. Booking Execution**
```typescript
// Step 5: Execute booking flow
const bookingResult = await this.triggerBookingFlow(token)
```

## 🧪 **Testing**

### **Manual Test**
```bash
# Test the booking automation manually
curl https://your-domain.vercel.app/api/test-booking
```

### **Local Testing**
```bash
# Run locally
npm run dev
curl http://localhost:3000/api/cron/booking
```

## ⚙️ **Configuration Options**

Edit `lib/booking-config.ts` to customize:

```typescript
export const BOOKING_CONFIG = {
  // Change credentials
  credentials: {
    phone: '0979251496',
    password: 'Nam@2025'
  },
  
  // Change timing
  timing: {
    cronSchedule: '25 8 * * *',  // 8:25 AM
    targetBookingTime: {
      hour: 8,
      minute: 30  // 8:30 AM
    }
  },
  
  // Update booking preferences
  bookingPreferences: {
    preferredCourtId: 'court_1',
    preferredTimeSlots: ['08:30', '09:00', '09:30'],
    duration: 60,
    maxRetries: 3
  }
}
```

## 📊 **Monitoring**

### **Vercel Dashboard**
- Check cron job execution in Vercel dashboard
- View function logs for debugging

### **GitHub Actions**
- Monitor deployment status
- Check for any build errors

### **Logs**
All operations are logged with `[CRON]` prefix:
```
[CRON] Starting login process...
[CRON] Login successful, token received
[CRON] Getting utilities...
[CRON] Utilities retrieved successfully
[CRON] Waiting for 8:30 AM precise timing...
[CRON] 8:30 AM reached! Triggering booking flow...
```

## 🔒 **Security**

- **Credentials**: Stored in configuration file (consider using environment variables for production)
- **API Keys**: Use Vercel environment variables for sensitive data
- **Rate Limiting**: Built-in retry mechanism with max attempts

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Login Failed**
   - Check credentials in `booking-config.ts`
   - Verify API endpoint is correct
   - Check network connectivity

2. **Utilities API Failed**
   - Verify token is valid
   - Check API endpoint and headers
   - Ensure proper authentication

3. **Booking Failed**
   - Check booking preferences
   - Verify court availability
   - Check booking API endpoint

### **Debug Steps**

1. **Check Vercel Logs**
   ```bash
   vercel logs --follow
   ```

2. **Test Manually**
   ```bash
   curl https://your-domain.vercel.app/api/test-booking
   ```

3. **Verify Cron Schedule**
   - Check `vercel.json` cron configuration
   - Ensure timezone is correct

## 📈 **Future Enhancements**

- [ ] Add email notifications for booking status
- [ ] Implement multiple court preferences
- [ ] Add retry logic for failed bookings
- [ ] Create web dashboard for monitoring
- [ ] Add booking history tracking
- [ ] Implement backup booking strategies

## 🎯 **Success Criteria**

The system is working correctly when:
- ✅ Cron job triggers at 8:25 AM daily
- ✅ Login succeeds with provided credentials
- ✅ Utilities API returns data successfully
- ✅ System waits until exactly 8:30 AM
- ✅ Booking flow executes at precise time
- ✅ Booking request is submitted successfully
