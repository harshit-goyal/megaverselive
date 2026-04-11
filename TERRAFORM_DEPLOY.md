# Deploy with Terraform (Recommended)

This is the **fastest and most reliable way** to deploy everything to Azure.

## Prerequisites

- Terraform installed: `brew install terraform`
- Azure CLI: `brew install azure-cli`
- Azure Subscription

## 3-Minute Deployment

### Step 1: Login to Azure

```bash
az login
```

This opens a browser - sign in with `harshit_goyal@outlook.com`

### Step 2: Get Your Subscription ID

```bash
az account show --query id -o tsv
```

Copy the output (starts with a UUID)

### Step 3: Configure Terraform

Edit `terraform/terraform.tfvars` and paste your subscription ID:

```hcl
subscription_id = "YOUR-SUBSCRIPTION-ID-HERE"
location        = "Central India"
```

### Step 4: Deploy

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Type `yes` when prompted.

**That's it!** Terraform will create:
- ✅ Resource Group
- ✅ App Service (F1 Free)
- ✅ PostgreSQL (B1ms Free)
- ✅ Database

### Step 5: Get Your Credentials

After deployment, run:

```bash
terraform output -raw database_password > /tmp/db_password.txt
terraform output app_service_url
terraform output database_host
```

Save these values!

## Next Steps

1. Get the outputs (App URL, DB host, password)
2. Update `backend/.env` with database credentials
3. Add Stripe keys to `.env`
4. Run: `npm run deploy:backend`
5. Add booking calendar to website

## Terraform Files

- `main.tf` - All Azure resources
- `terraform.tfvars` - Your configuration (subscription ID)

## Cleanup (Delete Everything)

```bash
cd terraform
terraform destroy
```

Type `yes` to confirm. All resources deleted, no charges!

## Troubleshooting

**"subscription_id is required"**
- Edit terraform.tfvars and add your subscription ID

**"not authenticated"**
- Run `az login` first

**"Resource already exists"**
- Run `terraform destroy` first, then `terraform apply`

---

**That's it! Deploy in 3 minutes.** 🚀
