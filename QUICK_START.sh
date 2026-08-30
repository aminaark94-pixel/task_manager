#!/bin/bash

# 🚀 FAMILY TASK MANAGER - QUICK START SETUP SCRIPT
# This script automates the initial configuration

echo "================================"
echo "Family Task Manager - Quick Setup"
echo "================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up..."
    mv .env .env.backup.$(date +%s)
fi

echo "📝 Creating .env file..."
cat > .env << 'EOF'
# ===== FAMILY TASK MANAGER CONFIGURATION =====

# 🤖 GEMINI API KEY (Get from https://ai.google.dev/aistudio)
# This is used for voice assistant AI features
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# 🌐 APPLICATION URL
# During local development, keep this as http://localhost:3000
# Change to your production URL when deploying
APP_URL="http://localhost:3000"

# ===== FIREBASE CONFIGURATION =====
# Get these from your Firebase Console: https://console.firebase.google.com
# If using the default Firebase setup, these might be injected at runtime

# FIREBASE_API_KEY=""
# FIREBASE_AUTH_DOMAIN=""
# FIREBASE_PROJECT_ID=""
# FIREBASE_STORAGE_BUCKET=""
# FIREBASE_MESSAGING_SENDER_ID=""
# FIREBASE_APP_ID=""

EOF

echo "✅ .env file created!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Get your API Keys:"
echo "   • Gemini API Key: https://ai.google.dev/aistudio"
echo "   • Firebase Config: https://console.firebase.google.com"
echo ""
echo "2️⃣  Edit the .env file:"
echo "   nano .env"
echo "   # Replace YOUR_GEMINI_API_KEY_HERE with actual key"
echo ""
echo "3️⃣  Install dependencies (if not already done):"
echo "   npm install"
echo ""
echo "4️⃣  Start development server:"
echo "   npm run dev"
echo ""
echo "5️⃣  Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "================================"
echo "Status: Configuration Ready! ✅"
echo "================================"
