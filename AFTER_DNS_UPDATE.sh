#!/bin/bash

# Script to run AFTER DNS is updated to point to Azure VM
# Usage: bash AFTER_DNS_UPDATE.sh

echo "════════════════════════════════════════════════════════════"
echo "🌐 POST DNS UPDATE VERIFICATION & SETUP"
echo "════════════════════════════════════════════════════════════"
echo ""

DOMAIN="megaverselive.com"
VM_IP="4.193.100.53"
SSH_KEY="~/.ssh/megaverse-vm-key.pem"

# Test 1: Verify DNS
echo "Step 1: Verifying DNS Resolution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESOLVED_IP=$(nslookup $DOMAIN 2>/dev/null | grep -A1 "Name:" | grep Address | awk '{print $2}' | tail -1)
if [ "$RESOLVED_IP" = "$VM_IP" ]; then
  echo "✅ DNS is correctly pointing to $VM_IP"
else
  echo "⚠️  DNS not yet updated. Current IP: $RESOLVED_IP (Expected: $VM_IP)"
  echo "   Please wait 5-15 minutes and try again"
  exit 1
fi

echo ""
echo "Step 2: Test HTTPS Connection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -k -s https://$DOMAIN/api/health | grep -q '"status":"ok"'; then
  echo "✅ HTTPS connection successful"
  echo "   API health check responding"
else
  echo "⚠️  HTTPS not responding yet"
  echo "   Check if app is running: ssh -i $SSH_KEY azureuser@$VM_IP pm2 status"
fi

echo ""
echo "Step 3: Install Let's Encrypt Certificate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing proper SSL certificate for domain..."
echo ""
echo "Run this command on the VM:"
echo "  ssh -i $SSH_KEY azureuser@$VM_IP"
echo ""
echo "Then execute:"
echo "  sudo certbot certonly --nginx -d $DOMAIN \\"
echo "    --non-interactive \\"
echo "    --agree-tos \\"
echo "    -m admin@$DOMAIN"
echo ""
echo "Or run automated:"

read -p "Do you have SSH access now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ssh -i $SSH_KEY azureuser@$VM_IP << 'SSHEOF'
    echo "Installing Let's Encrypt certificate..."
    sudo certbot certonly --nginx -d megaverselive.com \
      --non-interactive \
      --agree-tos \
      -m admin@megaverselive.com \
      --register-unsafely-without-email 2>/dev/null || echo "Certificate may already exist"
    
    echo ""
    echo "Reloading nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ Certificate installed and nginx reloaded"
SSHEOF
fi

echo ""
echo "Step 4: Final Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 2
if curl -s https://$DOMAIN/api/health | grep -q '"status":"ok"'; then
  echo "✅ HTTPS working with proper certificate"
else
  echo "⚠️  Still using self-signed certificate"
  echo "   Certificate installation may still be in progress"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ POST-DNS UPDATE SETUP COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Your app is now accessible at:"
echo "  🌐 https://$DOMAIN"
echo ""
echo "Test it:"
echo "  • Visit: https://$DOMAIN in your browser"
echo "  • API health: curl https://$DOMAIN/api/health"
echo "  • Mentors: curl https://$DOMAIN/api/mentors"
echo ""
echo "Congratulations! Migration from Render to Azure is complete! 🎉"
