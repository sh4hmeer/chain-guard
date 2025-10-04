#!/bin/bash

echo "🚀 ChainGuard MongoDB Setup Script"
echo "===================================="
echo ""

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed"
else
    echo "❌ MongoDB is not installed"
    echo ""
    echo "Installing MongoDB..."
    
    # Check OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS - Installing via Homebrew..."
        brew tap mongodb/brew
        brew install mongodb-community@7.0
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux - Please install MongoDB manually:"
        echo "Ubuntu/Debian: sudo apt-get install -y mongodb-org"
        echo "Visit: https://docs.mongodb.com/manual/installation/"
        exit 1
    else
        echo "Please install MongoDB manually from: https://www.mongodb.com/try/download/community"
        exit 1
    fi
fi

echo ""
echo "Starting MongoDB service..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start mongodb-community@7.0
    echo "✅ MongoDB service started"
else
    echo "Please start MongoDB manually: sudo systemctl start mongod"
fi

echo ""
echo "Testing MongoDB connection..."
sleep 2

if mongosh --eval "db.version()" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB is running and accessible"
else
    echo "⚠️  MongoDB might not be running. Please start it manually."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' (if not already done)"
echo "2. Run 'npm run dev:all' to start both frontend and backend"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🎉"
