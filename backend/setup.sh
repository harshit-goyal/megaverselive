#!/bin/bash
# Quick setup script for local development

echo "🚀 Setting up Megaverse Live Backend..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo "⚠️  Please fill in your credentials in .env"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Fill in .env with your Azure & Stripe keys"
echo "2. npm run dev"
echo "3. Call POST /api/admin/init-slots to generate available time slots"
echo ""
echo "📚 API Documentation:"
echo "   GET  /api/health - Check server status"
echo "   GET  /api/slots - Get available time slots"
echo "   POST /api/book - Create a booking"
echo "   POST /api/admin/init-slots - Generate available slots"
