#!/usr/bin/env node

/**
 * Megaverse Live - Azure Deployment Script
 * Deploys everything automatically using Azure SDK
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { InteractiveBrowserCredential } = require("@azure/identity");
const { ResourceManagementClient } = require("@azure/arm-resources");
const { WebSiteManagementClient } = require("@azure/arm-appservice");
const { PostgreSQLManagementClient } = require("@azure/arm-postgresql");

// Configuration
const CONFIG = {
  resourceGroup: 'megaverse-rg',
  location: 'centralindia',
  appServicePlan: 'megaverse-plan',
  appServiceName: 'megaverse-api',
  dbServerName: 'megaverse-db' + Math.random().toString(36).substring(7),
  dbName: 'megaverse_db',
  dbAdminUser: 'dbadmin',
  subscriptionId: null
};

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function main() {
  try {
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║  Megaverse Live - Azure Auto-Deploy       ║', 'blue');
    log('╚════════════════════════════════════════════╝\n', 'blue');

    // Step 1: Authenticate
    log('📝 Step 1: Authenticating with Azure...', 'yellow');
    const credential = new InteractiveBrowserCredential();
    
    // Get subscription ID
    const { data: subscriptions } = await axios.get(
      'https://management.azure.com/subscriptions?api-version=2020-01-01',
      { headers: { Authorization: `Bearer ${await credential.getToken("https://management.azure.com")}` } }
    );
    
    CONFIG.subscriptionId = subscriptions.value[0].subscriptionId;
    log(`✅ Authenticated! Subscription: ${CONFIG.subscriptionId}\n`, 'green');

    // Step 2: Create resource group
    log('🏗️  Step 2: Creating Resource Group...', 'yellow');
    const resourceClient = new ResourceManagementClient(credential, CONFIG.subscriptionId);
    
    await resourceClient.resourceGroups.createOrUpdate(CONFIG.resourceGroup, {
      location: CONFIG.location
    });
    log(`✅ Resource Group created: ${CONFIG.resourceGroup}\n`, 'green');

    // Step 3: Create App Service Plan
    log('🏗️  Step 3: Creating App Service Plan (F1 Free)...', 'yellow');
    const webClient = new WebSiteManagementClient(credential, CONFIG.subscriptionId);
    
    await webClient.appServicePlans.createOrUpdate(CONFIG.resourceGroup, CONFIG.appServicePlan, {
      location: CONFIG.location,
      sku: {
        name: 'F1',
        tier: 'Free',
        capacity: 0
      },
      kind: 'linux',
      reserved: true
    });
    log(`✅ App Service Plan created: ${CONFIG.appServicePlan}\n`, 'green');

    // Step 4: Create Web App
    log('🏗️  Step 4: Creating Web App...', 'yellow');
    await webClient.webApps.createOrUpdate(CONFIG.resourceGroup, CONFIG.appServiceName, {
      location: CONFIG.location,
      serverFarmId: `/subscriptions/${CONFIG.subscriptionId}/resourceGroups/${CONFIG.resourceGroup}/providers/Microsoft.Web/serverfarms/${CONFIG.appServicePlan}`,
      siteConfig: {
        linuxFxVersion: 'NODE|20-lts',
        alwaysOn: false,
        http20Enabled: true,
        nodeVersion: '20-lts'
      }
    });
    log(`✅ Web App created: ${CONFIG.appServiceName}\n`, 'green');

    // Step 5: Create PostgreSQL Database
    log('🏗️  Step 5: Creating PostgreSQL Database (B1ms Free)...', 'yellow');
    
    const dbPassword = generatePassword();
    const postgresClient = new PostgreSQLManagementClient(credential, CONFIG.subscriptionId);
    
    await postgresClient.servers.beginCreateAndWait(CONFIG.resourceGroup, CONFIG.dbServerName, {
      location: CONFIG.location,
      administratorLogin: CONFIG.dbAdminUser,
      administratorLoginPassword: dbPassword,
      sku: {
        name: 'Standard_B1ms',
        tier: 'Burstable',
        capacity: 1
      },
      storage: {
        storageSizeGB: 32
      },
      backup: {
        backupRetentionDays: 7,
        geoRedundantBackup: 'Disabled'
      },
      network: {},
      highAvailability: {
        mode: 'Disabled'
      }
    });
    
    log(`✅ PostgreSQL Server created: ${CONFIG.dbServerName}\n`, 'green');

    // Step 6: Create database
    log('🏗️  Step 6: Creating database...', 'yellow');
    await postgresClient.databases.beginCreateAndWait(
      CONFIG.resourceGroup,
      CONFIG.dbServerName,
      CONFIG.dbName,
      { charset: 'UTF8', collation: 'en_US.utf8' }
    );
    log(`✅ Database created: ${CONFIG.dbName}\n`, 'green');

    // Step 7: Configure firewall to allow Azure services
    log('🔒 Step 7: Configuring database firewall...', 'yellow');
    await postgresClient.firewallRules.beginCreateOrUpdateAndWait(
      CONFIG.resourceGroup,
      CONFIG.dbServerName,
      'AllowAllAzureServices',
      { startIpAddress: '0.0.0.0', endIpAddress: '255.255.255.255' }
    );
    log(`✅ Firewall configured\n`, 'green');

    // Step 8: Get Web App details
    log('📋 Step 8: Getting Web App details...', 'yellow');
    const webApp = await webClient.webApps.get(CONFIG.resourceGroup, CONFIG.appServiceName);
    const appUrl = `https://${webApp.defaultHostName}`;
    log(`✅ App URL: ${appUrl}\n`, 'green');

    // Summary
    log('═════════════════════════════════════════════', 'blue');
    log('✅ DEPLOYMENT COMPLETE!', 'green');
    log('═════════════════════════════════════════════\n', 'blue');

    log('📊 Your Azure Resources:', 'yellow');
    log(`   Resource Group: ${CONFIG.resourceGroup}`);
    log(`   App Service: ${CONFIG.appServiceName} (${appUrl})`);
    log(`   Database Server: ${CONFIG.dbServerName}.postgres.database.azure.com`);
    log(`   Database: ${CONFIG.dbName}`);
    log(`   DB Admin: ${CONFIG.dbAdminUser}`);
    log(`   DB Password: ${dbPassword}\n`);

    // Save credentials
    const envContent = `# Azure Resources Created
DB_HOST=${CONFIG.dbServerName}.postgres.database.azure.com
DB_USER=${CONFIG.dbAdminUser}@${CONFIG.dbServerName}
DB_PASSWORD=${dbPassword}
DB_NAME=${CONFIG.dbName}
DB_PORT=5432
NODE_ENV=production
PORT=8080

# Stripe (fill these in)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Email Service (fill these in)
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password_here
`;

    fs.writeFileSync(path.join(__dirname, 'backend', '.env'), envContent);
    log('✅ .env file created with Azure credentials\n', 'green');

    log('📝 Next Steps:', 'yellow');
    log('1. Edit backend/.env and add Stripe keys');
    log('2. Edit backend/.env and add Email credentials');
    log('3. Run: npm run deploy:backend');
    log('4. Add booking calendar to index.html');
    log('\n🎉 Your Megaverse Live is ready to deploy!\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, 'red');
    if (error.response?.data) {
      log(JSON.stringify(error.response.data, null, 2), 'red');
    }
    process.exit(1);
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pass = '';
  for (let i = 0; i < 16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
