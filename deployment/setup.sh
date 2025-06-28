#!/bin/bash
echo "🔧 Setting up MuseFuze Studios..."

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install --production

# Setup database (if configured)
if [ -f .env ]; then
    echo "🗄️  Setting up database..."
    npm run setup:db
else
    echo "⚠️  Please configure .env file before running database setup"
fi

echo "✅ Setup complete! Run ./start.sh to start the application"
