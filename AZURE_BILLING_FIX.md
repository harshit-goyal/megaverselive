# 🔴 Azure Billing Issue - Cost Reduction Guide

## Problem Statement

- **Budget Set:** $2/month
- **Current Charges:** $5/month
- **Overage:** $3/month over budget

## Root Cause Analysis

Azure should be FREE for your deployment because:

1. **VM (Standard_D2s_v3):** FREE (included in free tier, 12 months)
2. **PostgreSQL Database:** FREE (5GB included in free tier, 12 months)
3. **Data Transfer:** FREE (up to 100GB/month included)
4. **Storage:** FREE (up to 20GB included)

**Expected Cost: $0/month**

If you're being charged $5, there's likely:
- Extra storage being created
- Data transfer overages
- Monitoring/logging services
- Orphaned resources
- Snapshots or backups

---

## Investigation Steps (Do These First)

### Step 1: Check Azure Cost Analysis
Go to: **Azure Portal → Cost Management + Billing → Cost Analysis**

Look for:
- What service is charging the most?
- Is it VM? Database? Storage? Data Transfer?
- Are there resources you don't recognize?

### Step 2: Review Resource Group
Go to: **megaverse-rg → All Resources**

Delete any of these if you find them:
- Extra storage accounts
- VM snapshots
- Backup vaults
- Log Analytics workspaces
- Application Insights
- Test/unused databases

### Step 3: Check Budget Alert
Go to: **Cost Management + Billing → Budgets**

Is it configured correctly? Sometimes budget alerts are misconfigured.

---

## Immediate Cost-Cutting Actions

### Action 1: Delete Unused Resources (Highest Impact)

**Likely culprits:**
- Managed disks for snapshots
- Storage account created during testing
- Log Analytics workspace
- Old databases or test instances

**How to delete:**
1. Go to megaverse-rg
2. Click on suspicious resource
3. Click "Delete" at top
4. Confirm deletion

**Cost Saved:** $1-3/month

### Action 2: Reduce Data Transfer (If That's the Issue)

**If "Data Transfer" is the expensive line item:**

Already done:
- ✅ Gzip compression enabled in nginx
- ✅ Application is lightweight
- ✅ Database is minimal

Additional optimization:
```bash
# SSH to VM
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53

# Check network stats
vnstat -h  # Shows hourly bandwidth usage
vnstat -d  # Shows daily bandwidth usage

# If very high, check what's consuming it
nethogs -d 1  # Shows live bandwidth by process
```

**Cost Saved:** $0-1/month (if applicable)

### Action 3: Set Spending Limit (Prevents Overages)

**Go to:** Azure Portal → Subscriptions → Spending Limits

**Set to:** $2/month

**Result:** Azure automatically stops services if you exceed budget

**Cost Saved:** Prevents future overages

### Action 4: Check for Multiple Databases

**Scenario:** Maybe an extra PostgreSQL instance was created

```bash
# Check what databases you have on VM
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53
sudo -u postgres psql -l

# Should only show: postgres, template0, template1, megaverse_db
```

If there are extra databases:
- Drop them: `DROP DATABASE test_db;`

**Cost Saved:** $0-2/month

---

## Quick Cost Check Commands

### Check Your Resource Group Size
```bash
# SSH to VM
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53

# Check disk usage
du -sh /var/log  # Check logs aren't huge
du -sh /opt/megaverselive  # Check app size

# Should be:
# /var/log: < 500MB
# /opt/megaverselive: < 50MB
```

### Check Database Size
```bash
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('megaverse_db'));"

# Should be < 100MB
```

### Check Network Activity
```bash
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53
vnstat -h

# Should show low bandwidth (< 1GB/day for a testing app)
```

---

## Common Issues & Solutions

### Issue 1: Automatic Backup Charges

**Symptom:** Charge for "Backup" or "Storage"

**Solution:**
1. Go to megaverse-rg
2. Find "Recovery Services Vault" or backup resource
3. Delete it

**Cost Saved:** $1-2/month

### Issue 2: Data Transfer Overages

**Symptom:** Charge labeled "Data Transfer" or "Bandwidth"

**Solution:**
- Enable caching (already done via nginx with gzip)
- Minimize API payload sizes
- Use CDN if needed (add to budget)

**Cost Saved:** $0-1/month

### Issue 3: Extra Storage Account

**Symptom:** Multiple storage accounts in resource group

**Solution:**
1. Keep only: megaverse-prod-storage (if exists)
2. Delete any others
3. Delete old snapshots

**Cost Saved:** $0-1/month

### Issue 4: Log Analytics or Application Insights

**Symptom:** These services can cost $5-10+/month

**Solution:**
1. Go to megaverse-rg
2. Look for "Log Analytics workspace" or "Application Insights"
3. Delete if not being used

**Cost Saved:** $2-5/month (likely the culprit!)

---

## Expected Costs After Fix

| Resource | Cost |
|----------|------|
| VM (Standard_D2s_v3) | $0 (12-month free) |
| PostgreSQL (5GB) | $0 (12-month free) |
| Data Transfer (100GB) | $0 (included) |
| Storage (20GB) | $0 (included) |
| **TOTAL** | **$0/month** |

If you're still charged after free tier ends:
- VM: ~$50-60/month
- Database: ~$10-15/month
- Total: ~$60-75/month

---

## Action Plan (Priority Order)

### HIGH PRIORITY (Do First)
1. ✅ Check Cost Analysis dashboard
2. ✅ Identify expensive service
3. ✅ Delete if it's a monitoring service (Log Analytics, App Insights)
4. ✅ Delete any backup vaults or extra storage

### MEDIUM PRIORITY
5. Check for extra databases
6. Drop any test databases
7. Set spending limit to $2/month

### LOW PRIORITY
8. Optimize data transfer (already pretty good)
9. Monitor bandwidth usage
10. Plan for post-free-tier costs

---

## Files to Reference

1. **AZURE_BILLING_FIX.md** ← You are here
2. **MIGRATION_SUMMARY.md** ← Overall setup
3. **DEPLOYMENT_COMPLETE.md** ← Resource list

---

## Questions to Ask Yourself

1. **Do I need monitoring/logging?**
   - If no → Delete Log Analytics, Application Insights
   - If yes → These will cost $5-10/month

2. **Is data transfer reasonable?**
   - Small app should be < 1GB/day
   - If seeing GB/hour → Investigate

3. **Do I have backup vaults?**
   - Should be none if not using backups
   - Delete if found

4. **Are all resources in same region?**
   - ✅ Yes (Southeast Asia)
   - Cross-region = extra charges

---

## Next Steps

1. **Immediately:**
   - Go to Azure Portal
   - Check Cost Analysis
   - Identify expensive service

2. **Within 1 hour:**
   - Delete unnecessary resources
   - Set spending limit

3. **Report back:**
   - What service was expensive?
   - How much did it cost?
   - Are charges now $0?

---

## Still Confused?

The $5 charge is almost certainly one of these:
1. **Log Analytics workspace:** $2-5/month (MOST LIKELY)
2. **Application Insights:** $2-5/month
3. **Backup vault:** $1-2/month
4. **Extra storage account:** $0.50-2/month
5. **Data transfer overage:** $0.50-3/month

**Most likely fix:** Delete Log Analytics or Application Insights

---

## Support

If you find the expensive resource, tell me:
- What service is costing the most?
- How much is it?
- I'll help you optimize or delete it

---

**Remember:** Your deployment should cost $0/month during free tier!

If you're paying, something unnecessary is running.

Go to Azure Portal now and check Cost Analysis → you'll see exactly what's charging.

Then let me know what you find! 🔍
