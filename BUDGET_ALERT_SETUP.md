# Budget Alerts & Spending Limits Setup Guide

## Quick Start (15 Minutes Total)

Follow these steps to setup:
1. Azure spending limit (prevents bill shock)
2. Budget alerts (email warnings at thresholds)
3. Cost analysis dashboard (weekly monitoring)

All three are critical safety nets for your free tier account.

---

## Part 1: Set Spending Limit (Prevents Overcharging)

### What is a Spending Limit?
- **Hard stop** on resource consumption
- If you reach it: Azure pauses your resources
- Prevents surprise ₹50,000 bills
- Essential safety net for free tier accounts

### Step-by-Step (5 Minutes)

**Step 1: Open Azure Portal**
- Go to: https://portal.azure.com
- Sign in with your account

**Step 2: Search for Subscriptions**
- Click **Search bar** (top of portal)
- Type: "subscriptions"
- Click **Subscriptions** from results
```
┌─────────────────────────────────────────┐
│ Search Subscriptions                    │
├─────────────────────────────────────────┤
│ Subscriptions                           │
│ (under "Services")                      │
│                                         │
└─────────────────────────────────────────┘
```

**Step 3: Click Your Subscription**
- You'll see a list of subscriptions
- Click the one you're using (likely "Free Trial" or "Azure Free")
- Example name: "Free Trial - Azure Sponsorship"

**Step 4: Find Spending Limit**
- Left menu → Look for **"Spending limit"**
- If not visible, scroll down in left menu
```
Left Menu Items:
  • Overview
  • Cost analysis
  • Budgets
  • Alerts
  • Spending limit ← Click this
  • Azure role assignments
  • Properties
```

**Step 5: Set the Limit**
- Click **"Spending limit"**
- Current setting: Likely shows "Not set" or "Unlimited"
- Click **"Set spending limit"** button
```
Current spending limit: Unlimited
[Set spending limit] button
```

**Step 6: Enter Limit Amount**
- Enter: **₹150**
- Why ₹150?
  - Current charges: ₹507/month
  - ₹150 threshold allows normal operation
  - If something goes wrong: alert before damage
- Click **"Update"** button

**Step 7: Confirmation**
- You should see: "Spending limit set to ₹150"
- If you see error: Try again or contact support
```
✅ Spending limit successfully set to ₹150
   When your subscription reaches ₹150, your resources
   will be automatically stopped to prevent further charges.
```

**Done!** Spending limit is now active.

---

## Part 2: Setup Budget Alerts (Email Warnings)

### What are Budget Alerts?
- Email notifications when spending reaches thresholds
- Three alerts: 50%, 75%, 100% of budget
- Gives you time to investigate before limit hit
- Essential for weekly cost monitoring

### Step-by-Step (10 Minutes)

**Step 1: Go to Cost Management**
- From: Azure Portal home
- Search for: "Cost Management"
- Click **"Cost Management"** from results
```
Search bar → Type "Cost Management"
↓
Results → Click "Cost Management + Billing"
↓
Opens Cost Management portal
```

**Step 2: Find Budgets**
- Left menu → Look for **"Budgets"**
- Click it
```
Left Menu:
  • Cost analysis ← You might see this first
  • Budgets ← Click this
  • Alerts
  • Recommendations
  • Exports
```

**Step 3: Create New Budget**
- Click **"+ Create budget"** or **"+ Add"** button
- If you see existing budget: You can edit it or create new
- Look for: Blue button with "+" symbol
```
═══════════════════════════════
║ Budgets                     ║
║                             ║
║ [+ Create budget]           ║
║ OR                          ║
║ [+ Add]                     ║
╚═══════════════════════════════
```

**Step 4: Fill Budget Details**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | "Monthly Cost Budget" | Or any name you prefer |
| **Budget Type** | "Monthly" | Resets each month |
| **Reset Period** | "Calendar month" | Jan 1, Feb 1, etc |
| **Scope** | Your subscription | Should auto-select |
| **Budget Amount** | ₹150 | Same as spending limit |

**Step 5: Set Alert Thresholds**

When creating budget, you'll see alert options. Set these three:

```
Alert 1: When spending reaches 50% of budget (₹75)
        → Status: Enabled ✓
        → Threshold: 50%
        
Alert 2: When spending reaches 75% of budget (₹112.50)
        → Status: Enabled ✓
        → Threshold: 75%
        
Alert 3: When spending reaches 100% of budget (₹150)
        → Status: Enabled ✓
        → Threshold: 100%
```

**Step 6: Set Alert Recipients**

Who should get email alerts?

```
Alert Recipients:
  ☑ Email: your-email@gmail.com
  □ Alert role: (optional, skip for now)
  
[+ Add recipient] (if multiple people should be alerted)
```

- Enter your email address
- This is where you'll get alert emails
- Can add multiple emails if needed

**Step 7: Review & Create**

- Review all settings one more time
- Check: Budget amount = ₹150 ✓
- Check: Alert thresholds at 50%, 75%, 100% ✓
- Check: Your email entered ✓
- Click **"Create budget"** button

```
Budget Summary:
  Name: Monthly Cost Budget
  Amount: ₹150
  Period: Monthly
  Alerts: 3 enabled (50%, 75%, 100%)
  Recipients: your-email@gmail.com
  
[← Back] [Create budget]
```

**Step 8: Confirmation**

- You should see: "Budget created successfully"
- Budget now appears in your budgets list
- Alerts will be sent to your email when thresholds hit

```
✅ Budget successfully created
   You'll receive email alerts at 50%, 75%, and 100% of ₹150
```

**Done!** Budget alerts are now active.

---

## Part 3: Create Cost Analysis Dashboard

### What is Cost Analysis?
- Visual dashboard showing your spending
- Broken down by service (VM, Database, Storage)
- Shows trends over time
- Perfect for weekly monitoring

### Step-by-Step (5 Minutes)

**Step 1: Go to Cost Analysis**
- Azure Portal → Search "Cost Management"
- Left menu → **"Cost analysis"**
- OR direct link: portal.azure.com → Search "Cost analysis"

**Step 2: View Current Costs**

The dashboard shows:
```
┌─────────────────────────────────────────┐
│ Cost Analysis Dashboard                 │
├─────────────────────────────────────────┤
│ Total Cost (This Month):  ₹507          │
│                                         │
│ [Bar Chart showing breakdown]           │
│                                         │
│ Cost by Service:                        │
│  ├─ Virtual Machines: ₹462.16           │
│  ├─ IP Addresses: ₹37.38                │
│  ├─ Storage: ₹7.89                      │
│  └─ Other: ₹0                           │
│                                         │
│ Cost Trend (7 days):  [Line chart]      │
└─────────────────────────────────────────┘
```

**Step 3: Filter by Time Period**

By default shows "Current Month". You can change:

- **This Month** (default) - Month-to-date
- **Last Month** - Previous full month
- **Last 7 Days** - Weekly view (good for daily checks)
- **Last 30 Days** - Rolling 30 days
- **Custom Range** - Pick any date range

```
Period Filter:
  ☑ This Month
  ☐ Last Month
  ☐ Last 7 days
  ☐ Last 30 days
  ☐ Custom range
```

**Step 4: Group Cost Breakdown**

Change how costs are grouped:

- **By Service** (default) - VM, Database, Storage
- **By Location** - Southeast Asia, etc
- **By Subscription** - If you have multiple
- **By Resource Group** - If you organized that way

```
Group by: [By Service ▼]
```

**Step 5: Daily Cost Monitoring**

For daily checks, use **"Last 7 Days"** view:
- Shows trend over past week
- Should see consistent ₹70-80/day (₹507/30 days)
- Alert if: Sudden spike or ₹0 (free tier working!)

**Step 6: Bookmark This Page**

- Add to browser bookmarks for quick access
- Bookmark name: "Azure Cost Dashboard"
- Check weekly: Sunday morning ritual

**Done!** Cost dashboard is ready for weekly monitoring.

---

## Part 4: Testing Your Setup

### Test 1: Verify Spending Limit is Active

**How to check:**
1. Azure Portal → Subscriptions → Spending limit
2. Should show: "Spending limit set to ₹150"
3. If shows "Not set": Repeat Part 1

**Expected result:** ✅ Spending limit active

---

### Test 2: Verify Budget Alerts are Active

**How to check:**
1. Azure Portal → Cost Management → Budgets
2. Should show: "Monthly Cost Budget" (or whatever you named it)
3. Should show: 3 alerts configured (50%, 75%, 100%)
4. Should show: Your email address as recipient

**Expected result:** ✅ Budget alerts active

---

### Test 3: Verify Cost Analysis Accessible

**How to check:**
1. Azure Portal → Cost Management → Cost analysis
2. Should see: Total cost (~₹507 for full month)
3. Should see: Breakdown by service
4. Should see: Cost trend chart

**Expected result:** ✅ Cost analysis working

---

### Test 4: Simulate Alert (Optional)

**To test if alerts actually send (advanced):**

Unfortunately, Azure doesn't have an easy "test alert" button. Alerts trigger automatically when thresholds hit. You'll know they work when you receive first one (at ₹75 spending if starting from ₹0).

**Alternative:** When your monthly cost naturally hits ₹75, check email for alert. If you get it → ✅ alerts are working.

---

## Weekly Monitoring Checklist

Every Sunday morning (5 minutes):

```
□ Open Azure Portal
□ Go to Cost Management → Cost analysis
□ Check: Total cost this month
  Expected: ₹0 (if free tier) or up to ₹507
  Alert if: > ₹600 (something's wrong)
□ Check: Cost breakdown by service
  Expected: VM ~₹462, IP ~₹37, Storage ~₹8
  Alert if: Unexpected charges
□ Go to: Subscriptions → Spending limit
  Expected: "Spending limit set to ₹150"
  Alert if: Shows "Not set"
□ Go to: Cost Management → Budgets
  Expected: "Monthly Cost Budget" with 3 alerts
  Alert if: Budget deleted or alerts disabled
□ Check email: Any alert emails received this week?
  Expected: None (assuming normal operation)
  Action if: Yes → Investigate immediately
```

---

## Troubleshooting

### Problem: Can't find Spending Limit in menu

**Solution:**
- Try refreshing page (F5)
- Try different browser
- Go direct URL: portal.azure.com → Search "spending limit"
- Contact Azure support if still not found

### Problem: Budget creation fails

**Solution:**
- Verify subscription selected correctly
- Try creating with round number (₹100 instead of ₹75)
- Clear browser cache and try again
- Contact Azure support

### Problem: Alerts not sending

**Reasons:**
- Email in spam folder → Check spam folder
- Email address typo → Edit budget, verify email
- Alert threshold not reached yet → Check when ₹75 spent
- Email notifications disabled → Contact support

### Problem: Cost shows ₹0 (nothing charged?)

**This is GOOD!** Means:
- ✅ Free tier is working perfectly
- ✅ All charges covered by free credits
- ✅ No surprise bills coming

No action needed. Just keep monitoring weekly.

### Problem: Cost shows way more than ₹507

**Solutions:**
1. Check "Cost Analysis" → "Breakdown by service"
   - Find what's costing money
   - Expected: VM, IP, Storage only
   - Unexpected: Database, Backup, Monitoring, etc

2. Delete unexpected services
   - Go to: Resource Group → megaverse-rg
   - Find unwanted resource
   - Click → Delete

3. Review spending limit (should be ₹150 to catch this)
   - If exceeded → Resources paused
   - Verify if needed

---

## FAQ

**Q: Why need both spending limit AND budget alerts?**
A: Different purposes:
- **Spending limit** = Hard stop (prevents charges beyond limit)
- **Budget alerts** = Early warning (emails before limit hit)
- Together = Safety net with warnings

**Q: Will spending limit affect my app?**
A: Only if you hit the limit:
- Normal month: ₹0-507 spent → No impact
- Exceed ₹150 limit: Resources stop → App goes offline
- Recovery: Raise limit or clear charges

You won't normally hit ₹150 limit (unless something breaks and costs skyrocket).

**Q: Can I change spending limit later?**
A: Yes, anytime. Go to Subscriptions → Spending limit → Update.

**Q: Can I have multiple budgets?**
A: Yes! You can create separate budgets:
- Budget for VM only
- Budget for Database only
- Budget for total (recommended)

**Q: What if my app uses >₹150 in a month?**
A: Two options:
1. Raise spending limit to ₹200 or ₹300 (before it happens)
2. If it happens by surprise:
   - Resources pause (app goes offline)
   - You get alert emails
   - Raise limit to resume

Better to set limit high enough to allow normal ops, or set alerts to catch issues early.

**Q: Do alerts cost anything?**
A: No! Budgets and alerts are free.

**Q: Can I get alerts on my phone?**
A: Alerts go to email. You can:
- Enable email notifications on phone
- Forward alerts to SMS (through email gateway)
- Check email regularly

---

## Summary

✅ Spending limit set to ₹150 (hard stop)  
✅ Budget alerts created (email warnings)  
✅ Cost analysis dashboard ready (weekly monitoring)  
✅ All tests passing (everything working)  
✅ Weekly checklist created (consistency)  

**Next week:** Sunday morning, do 5-minute weekly check using the checklist above.

**Next month:** When first bill would arrive (April 22), verify:
- Charges are within expected range
- Spending limit prevented overages
- Budget alerts arrived on schedule
- Cost analysis shows expected breakdown

You're protected! 🛡️
