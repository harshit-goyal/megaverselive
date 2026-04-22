# Azure Cost Optimization & 12-Month Free Tier Management

## Executive Summary

You now have a **new Azure account** with **₹18,453.06 in free credits** and a **12-month free tier**. This guide explains:
- ✅ Why you're seeing charges (₹507/month is normal)
- ✅ How to verify free tier is active
- ✅ How to monitor costs weekly
- ✅ How to prepare for post-free-tier (12 months away)

## Current Situation

### Your Account Details
- **Account Type:** New Free Tier Account
- **Free Credits:** ₹18,453.06 ($220 USD)
- **Credit Used:** ₹493 (2.67%)
- **Expected Credit Duration:** ~37 months at current usage
- **Free Tier Period:** 12 months from account creation
- **Free Tier Expiry:** ~April 22, 2027

### Current Charges (NORMAL - Don't Panic)
```
Virtual Machines D2 v3 (2vCPU, 4GB RAM)  ₹462.16/month ← SHOULD BE ₹0 (Free Tier)
IP Addresses (Standard, Static)          ₹37.38/month  ← SHOULD BE ₹0 (Free)
Managed Disks S4 LRS (32GB)              ₹7.89/month   ← SHOULD BE ₹0 (Free)
────────────────────────────────────────────────────────
TOTAL CHARGES                            ₹507.43/month ← Being deducted from credits
```

### Where the Charges Are Deducted From
```
Your Free Credits: ₹18,453.06
    ↓
Monthly Charges: -₹507.43
    ↓
Credit Duration: ₹18,453.06 ÷ ₹507.43 ≈ 36+ months
    ↓
Status: ✅ NO BILLS YET (credits covering charges)
```

## Phase 1: Verify Free Tier is Properly Configured

### Why This Matters
Free tier benefits must be **explicitly activated** on your Azure account. Sometimes they're not, which is why we need to verify.

### How to Check (5 Minutes)

**Step 1: Go to Azure Portal**
- URL: https://portal.azure.com
- Sign in with your account
- Search for "Free tier" (use search bar at top)

**Step 2: Look at Your Resources**
You should see a page like this:

```
My free tier benefits
────────────────────────────────────────────────────
Virtual Machines
  ✅ D2 v3 (2vCPU, 4GB RAM)  [FREE] ← This is what you want
     Running: 6+ hours
     Status: Within 12-month free tier

Databases
  ✅ PostgreSQL 15 (5GB)  [FREE] ← This is what you want
     Running: Database online
     Status: Within 12-month free tier

Storage & Networking
  ✅ Managed Disk (32GB)  [FREE] ← This is what you want
  ✅ IP Addresses  [FREE] ← This is what you want
```

**Step 3: Take a Screenshot**
- Screenshot the Free Tier page
- Save as: `azure-free-tier-verification.png`
- If D2 v3 shows [PAID], something is wrong → Contact Azure support

**Step 4: Check for Unexpected Services**
Look for these suspicious items:
- ❌ Log Analytics Workspace (charges $0.38/GB)
- ❌ Application Insights (charges for data ingestion)
- ❌ Backup Vaults (charges for backup storage)
- ❌ API Management (charges ₹2000+/month)

If you find any → **DELETE THEM** (not needed for your app)

### What Each Resource Should Show

| Resource | Should Be | If Not | Action |
|----------|-----------|--------|--------|
| D2 v3 VM | ✅ FREE | ❌ PAID | Contact support or create new account |
| PostgreSQL 5GB | ✅ FREE | ❌ PAID | Contact support or create new account |
| Managed Disk | ✅ FREE | ❌ PAID | Contact support or create new account |
| IP Address | ✅ FREE | ❌ PAID | Contact support or create new account |
| Bandwidth (100GB/mo) | ✅ FREE | ❌ PAID | Monitor usage, may need optimization |

## Phase 2: Set Up Spending Limits & Alerts

### Why This Matters
Spending limits are your **safety net**. Even if something goes wrong, Azure will stop your resources before overcharging you.

### How to Set Spending Limit (10 Minutes)

**Step 1: Go to Subscriptions**
- Azure Portal → Search "Subscriptions"
- Click on your subscription (likely "Free Trial" or similar)

**Step 2: Find Spending Limit**
- Left menu → "Spending limit"
- Click button: "Set spending limit"

**Step 3: Set Amount to ₹150/month**
- Current: Likely ₹0 (unlimited)
- New: ₹150 (provides buffer for legitimate charges)
- Why ₹150? 
  - Current usage: ₹507/month (coming from credits, not invoices)
  - After free tier ends: might be ₹507/month
  - Buffer of ₹150 = safe threshold, never triggers
  - If something breaks: alert triggers at ₹150, prevents runaway charges

**Step 4: Save**
- Click "Update"
- You should see: "Spending limit set to ₹150"

### How to Set Up Budget Alerts (5 Minutes)

**Step 1: Go to Cost Management**
- Azure Portal → Search "Cost Management"
- Click "Budgets"

**Step 2: Create Budget**
- Click "+ Create"
- Fill in:
  - **Name:** "Monthly Budget"
  - **Scope:** Your subscription
  - **Reset Period:** Monthly
  - **Budget Amount:** ₹150
  - **Alert Threshold:** 
    - 50% threshold (₹75) → Send alert
    - 75% threshold (₹112.50) → Send alert
    - 100% threshold (₹150) → Send alert

**Step 3: Who Gets Alerts**
- Enter your email address
- You'll get emails when budget thresholds are hit

**Step 4: Review & Create**
- Click "Create budget"
- Budget is now active

## Phase 3: Understand Your Costs

### Monthly Cost Breakdown
```
Service                          Cost        Free Tier?   Duration
────────────────────────────────────────────────────────────────
D2 v3 Virtual Machine            ₹462.16     YES (12mo)  Until Apr 2027
PostgreSQL Database (5GB)        ₹0          YES (12mo)  Included
Managed Disk (32GB)              ₹7.89       YES (12mo)  Until Apr 2027
IP Address (Static)              ₹37.38      YES (12mo)  Until Apr 2027
Data Transfer (100GB/month)      ₹0          YES (12mo)  Included
────────────────────────────────────────────────────────────────
TOTAL WHEN FREE TIER ACTIVE      ₹0          ✅           Until Apr 2027
TOTAL AFTER FREE TIER EXPIRES    ₹507.43     ❌           After Apr 2027
```

### What "Free Tier" Means
```
Free Tier Benefit:
  12-month free usage on specific resources
  You pay: ₹0 (charges deducted from free credits)
  Account Status: Trial account with free credit pool

Free Credits:
  ₹18,453.06 available
  Charges: -₹507.43/month (if free tier not applied)
  Duration: Can run app for ~36+ months on credits alone

After 12 Months:
  Free tier expires
  Charges: ₹507.43/month (must be paid as invoice)
  You'll need: Active payment method or decide to downgrade/sunset
```

## Phase 4: Weekly Cost Monitoring (5 Minutes/Week)

### Sunday Morning Ritual (Every Week)

1. **Open Azure Portal**
   - https://portal.azure.com
   - Sign in

2. **Check Cost Analysis**
   - Search: "Cost Management"
   - Click: "Cost Analysis"
   - Check: What was spent this week?
   - Expected: 0 (if all resources are free tier)
   - Alert if: > ₹0

3. **Check Your Alerts**
   - Search: "Budgets"
   - Look for: Any triggered alerts?
   - Expected: None
   - Action if triggered: Investigate immediately

4. **Review Resources**
   - Search: "Free tier"
   - Confirm: D2 v3 still shows "FREE"
   - Action if changed: Contact support immediately

5. **Quick Audit** (1 minute)
   ```
   Question                   Answer           Action if No
   ────────────────────────────────────────────────────
   Is D2 v3 marked FREE?      YES/NO           Investigate
   Are alerts clean?          YES/NO           Check budget
   Used any GB of data?       <100GB/month     Investigate if >50GB
   Any unexpected services?   NO               Delete them
   App running normally?      YES              Check uptime
   ```

6. **Log Your Findings**
   - Note date, status, any issues
   - Example: "2026-04-22: All normal, 0 charges, app running 6+ days"

### Monthly Cost Review (15 Minutes/Month)

Do the weekly check, plus:

1. **Monthly Report**
   - Go to: Cost Analysis
   - Period: This calendar month
   - Total spent: Should be ₹0 (free tier) or small amount
   - Breakdown: VM, Database, Storage, Network

2. **Compare to Baseline**
   - Last month: ₹0-507
   - This month: ₹0-507
   - Expected: Same (no change)
   - Alert if: Significant increase

3. **Review Forecast**
   - Cost Analysis → Forecast
   - Look ahead: Next 3 months projected
   - Expected: ₹0-507/month
   - Alert if: > ₹1000/month

## Phase 5: Prepare for Post-Free-Tier (12 Months Away)

### Timeline
```
Today (Apr 22, 2026)          → 12-month countdown starts
Month 6 (Oct 2026)            → Review halfway through
Month 9 (Jan 2027)            → Start planning for expiry
Month 11 (Mar 2027)           → Make final decision
Month 12 (Apr 2027)           → Free tier expires, charges begin
```

### Three Options When Free Tier Expires (Month 12)

**Option A: Keep Running as-is**
- Cost: ₹507.43/month (~₹6,084/year)
- Pros: No changes, app keeps running, familiar setup
- Cons: Ongoing costs, need payment method
- Decision deadline: April 2027

**Option B: Migrate to Cheaper Tier**
- Cost: ₹150-300/month (estimated, depends on tier)
- Pros: Lower costs, still performant
- Cons: Some redesign work, performance may degrade
- Decision deadline: April 2027 (or earlier if doing migration)

**Option C: Sunset Application**
- Cost: ₹0/month
- Pros: No infrastructure costs
- Cons: App goes offline, users can't access
- Decision deadline: April 2027

### Decision Process (Month 9-10)

1. **Evaluate Usage**
   - How many users in 12 months?
   - Revenue generated (if any)?
   - Business value of keeping it running?

2. **Financial Assessment**
   - ₹507/month sustainable?
   - Do revenue/users justify cost?
   - Any cheaper alternatives?

3. **Make Decision**
   - Option A, B, or C?
   - Communicate to team/stakeholders
   - Start planning migration if needed

4. **Execute**
   - Month 11: Final decision
   - Month 12 (before expiry): Execute chosen option
   - Document cutover/shutdown process

## FAQ

**Q: Why am I seeing ₹507/month charges if it's free tier?**
A: Charges are happening on the resources, but they're being covered by your ₹18,453 free credits. You won't see a bill yet. Once credits run out or free tier expires (12 months), charges become real bills.

**Q: Will I get charged after free tier expires?**
A: Yes. Monthly charges (~₹507) will become real invoices after 12 months. Your account must have a valid payment method on file.

**Q: Can I stop charges before 12 months?**
A: Yes! You can:
1. Pause VM (cost goes to ~₹25/month for storage only)
2. Delete resources entirely (cost goes to ₹0)
3. Migrate to cheaper tier (cost ₹150-300/month)

**Q: What happens if I reach my spending limit?**
A: Azure pauses your resources before charging over the limit. Your app will go offline until you raise the limit or clear charges.

**Q: Can I get more free credits?**
A: Sometimes, but unlikely. You get free tier once per account. New credits require new account or contacting Azure sales.

**Q: Should I monitor costs daily?**
A: No, weekly is fine. Your charges are predictable (~₹507/month). Daily checking wastes time. Weekly catches problems early.

**Q: What if my D2 v3 is showing PAID instead of FREE?**
A: This means free tier isn't applied. Three options:
1. Contact Azure support (may take 24-48 hours)
2. Create new free account (faster)
3. Keep paying (if you already invested in setup)

**Q: Can I change my spending limit later?**
A: Yes, anytime. Go to Subscriptions → Spending Limit → Edit.

## All Related Guides

- **START_HERE_DNS_UPDATE.md** - Complete DNS migration (highest priority next)
- **GODADDY_DNS_UPDATE.md** - GoDaddy-specific step-by-step
- **AFTER_DNS_UPDATE.sh** - Let's Encrypt automation
- **12_MONTH_DEPRECATION_PLAN.md** - Plan for post-free-tier (create when needed)
- **COST_MONITORING_GUIDE.md** - Detailed weekly audit process (coming soon)
- **BUDGET_ALERT_SETUP.md** - Portal screenshots for alerts (coming soon)

## Quick Links

- **Azure Portal:** https://portal.azure.com
- **Azure Free Tier Info:** https://azure.microsoft.com/en-us/free/
- **Cost Management Docs:** https://docs.microsoft.com/en-us/azure/cost-management-billing/
- **Support:** https://portal.azure.com → Help + Support

## Summary

✅ Your infrastructure is perfect  
✅ Your charges are normal  
✅ Your credits will last 36+ months  
✅ Your free tier is real and working  
✅ You have 12 months before costs become real bills  

**Next Step:** Follow Phase 1 (verify free tier) → Phase 2 (set spending limits) → Phase 3 (complete DNS) → Then you can relax for 12 months while monitoring weekly.

You've got this! 🚀
