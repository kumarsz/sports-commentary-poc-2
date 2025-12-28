#!/bin/bash

# CricketAI Backend Restart Script
# Kills any process on port 8000 and restarts the backend server

echo "🔄 Restarting CricketAI Backend Server..."
echo ""

# Check if anything is running on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⏹️  Found process on port 8000. Stopping it..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✅ Process stopped."
    sleep 1
else
    echo "ℹ️  No process found on port 8000."
fi

echo ""
echo "🚀 Starting backend server..."
echo "📍 Server will run on http://localhost:8000"
echo ""

# Start the backend
npm run dev
