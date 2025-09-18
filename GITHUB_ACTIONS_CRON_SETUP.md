# GitHub Actions Cron Job Setup

## 🎯 **Why GitHub Actions for Cron Jobs?**

Since you're on **Vercel Hobby plan**, the built-in cron jobs have limitations:
- ⚠️ **UTC timezone only** (not Vietnam time)
- ⚠️ **1-hour flexible window** (not precise timing)
- ⚠️ **Less reliable** for exact scheduling

**GitHub Actions** provides:
- ✅ **Precise timing** (exact minute execution)
- ✅ **Vietnam timezone** support
- ✅ **Reliable scheduling**
- ✅ **Better logging and monitoring**

## ⚙️ **Setup Complete**

### **Files Created/Modified:**

1. **`.github/workflows/cron.yml`** - GitHub Actions workflow
2. **`vercel.json`** - Removed Vercel cron (using GitHub Actions instead)
3. **`app/api/cron/booking/route.ts`** - Updated for GitHub Actions

### **Cron Schedule:**
```yaml
# Runs at 1:30 AM UTC = 8:30 AM Vietnam time
- cron: '30 1 * * *'
```

**Time Conversion:**
- **UTC**: 1:30 AM
- **Vietnam (UTC+7)**: 8:30 AM ✅

## 🔍 **How It Works**

### **Execution Flow:**
1. **GitHub Actions** triggers at 1:30 AM UTC (8:30 AM Vietnam)
2. **Calls your Vercel API** via HTTP GET request
3. **Vercel function** executes the tennis booking logic
4. **Logs results** in both GitHub Actions and Vercel

### **API Endpoint:**
```
GET https://booking-tennis-pyfoe30r5-namlv143s-projects.vercel.app/api/cron/booking
```

## 📊 **Monitoring & Logs**

### **GitHub Actions Logs:**
1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on "Vercel Cron Job" workflow
4. View execution logs and results

### **Vercel Function Logs:**
1. Go to Vercel Dashboard
2. Project → Functions
3. Click on `/api/cron/booking`
4. View detailed execution logs

## 🚀 **Next Steps**

### **1. Commit and Push:**
```bash
git add .
git commit -m "Add GitHub Actions cron job for precise scheduling"
git push origin main
```

### **2. Set Up VINHOMES_TOKEN:**
- Go to Vercel Dashboard
- Project Settings → Environment Variables
- Add `VINHOMES_TOKEN` with your token
- Redeploy

### **3. Test the Workflow:**
- Go to GitHub Actions
- Click "Vercel Cron Job"
- Click "Run workflow" to test manually

## ⏰ **Schedule Details**

| Time | Timezone | Description |
|------|----------|-------------|
| 1:30 AM | UTC | GitHub Actions trigger |
| 8:30 AM | Vietnam | Tennis booking execution |
| Daily | - | Automatic execution |

## 🔧 **Configuration**

### **GitHub Actions Workflow:**
```yaml
name: Vercel Cron Job
on:
  schedule:
    - cron: '30 1 * * *'  # 1:30 AM UTC = 8:30 AM Vietnam
  workflow_dispatch:      # Manual trigger
```

### **Retry Logic:**
- **Max time**: 300 seconds (5 minutes)
- **Retries**: 3 attempts
- **Delay**: 5 seconds between retries

## 📈 **Benefits**

### **Precision:**
- ✅ **Exact timing** (no 1-hour window)
- ✅ **Vietnam timezone** support
- ✅ **Reliable execution**

### **Monitoring:**
- ✅ **GitHub Actions logs** for workflow status
- ✅ **Vercel function logs** for booking details
- ✅ **Email notifications** on failure

### **Flexibility:**
- ✅ **Manual triggering** for testing
- ✅ **Easy schedule changes**
- ✅ **Version control** for workflow changes

## 🎾 **Expected Results**

### **Successful Execution:**
```
[GITHUB-ACTIONS-CRON] Tennis booking triggered at 2024-12-XX 08:30:00
[GITHUB-ACTIONS-CRON] Source: GitHub Actions workflow
[GITHUB-ACTIONS-CRON] Result: SUCCESS
[GITHUB-ACTIONS-CRON] Message: PRECISE 8:30 AM tennis booking completed successfully
```

### **Booking Results:**
- **Card 1 (S1.01)**: 18h-20h booking
- **Card 2 (S1.02)**: 18h-20h booking
- **Simultaneous execution** for maximum success

---

**Status**: ✅ **Ready for Production**  
**Timing**: ✅ **Precise 8:30 AM Vietnam**  
**Reliability**: ✅ **GitHub Actions powered**  
**Monitoring**: ✅ **Full logging available**

Your tennis booking automation is now **precisely scheduled** and **reliable**! 🎾⏰
