#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function run(cmd, description) {
  log(`\n${description}...`, 'yellow');
  try {
    const { stdout } = await execAsync(cmd);
    return stdout.trim();
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  try {
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║  Megaverse Live - Azure Deployment       ║', 'blue');
    log('╚════════════════════════════════════════════╝', 'blue');

    // Check if az CLI exists
    try {
      await execAsync('az --version');
    } catch {
      log('\nAzure CLI not found. Installing...', 'red');
      await run('brew install azure-cli', 'Installing Azure CLI');
    }

    log('\nStep 1: Logging into Azure', 'yellow');
    await run('az login', 'Login to Azure');

    log('\nStep 2: Getting subscription ID', 'yellow');
    const subId = await run('az account show --query id -o tsv', 'Get subscription');
    log(`Subscription: ${subId}`, 'green');

    log('\nStep 3: Creating resource group', 'yellow');
    await run('az group create --name megaverse-rg --location centralindia', 'Create RG');
    log('Resource group created', 'green');

    log('\nStep 4: Creating App Service Plan', 'yellow');
    await run('az appservice plan create --name megaverse-plan --resource-group megaverse-rg --sku F1 --is-linux', 'Create plan');
    log('App Service Plan created', 'green');

    log('\nStep 5: Creating Web App', 'yellow');
    await run('az webapp create --resource-group megaverse-rg --plan megaverse-plan --name megaverse-api --runtime "NODE|20-lts"', 'Create app');
    log('Web App created', 'green');

    log('\nStep 6: Creating PostgreSQL Server', 'yellow');
    const dbPassword = 'MegaLive123!@#';
    await run('az postgres flexible-server create --name megaverse-db --resource-group megaverse-rg --location centralindia --admin-user dbadmin --admin-password MegaLive123!@# --sku-name Standard_B1ms --tier Burstable --storage-size 32 --public-access all --yes', 'Create DB');
    log('PostgreSQL created', 'green');

    log('\nStep 7: Creating database', 'yellow');
    await run('az postgres flexible-server db create --server-name megaverse-db --resource-group megaverse-rg --database-name megaverse_db', 'Create DB');
    log('Database created', 'green');

    log('\nStep 8: Getting resource details', 'yellow');
    const appUrl = await run('az webapp show --resource-group megaverse-rg --name megaverse-api --query defaultHostName -o tsv', 'Get app URL');
    const dbHost = await run('az postgres flexible-server show --resource-group megaverse-rg --name megaverse-db --query fqdnFullyQualified -o tsv', 'Get DB host');

    log('\nDEPLOYMENT COMPLETE!', 'green');
    log('\nYour Azure Resources:', 'yellow');
    log(`  App: https://${appUrl}`);
    log(`  Database: ${dbHost}`);
    log(`  Password: ${dbPassword}`);

  } catch (error) {
    log(`Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
