#!/bin/bash

# Unisynth Quick Start Script
# This script starts all components of Unisynth

echo "🚀 Starting Unisynth..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd "$DIR/backend"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
npm start &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to start
sleep 3

# Start viewer
echo -e "${BLUE}Starting 3D Viewer...${NC}"
cd "$DIR/viewer"
if [ ! -d "node_modules" ]; then
    echo "Installing viewer dependencies..."
    npm install
fi
npm run dev &
VIEWER_PID=$!
echo -e "${GREEN}✓ Viewer started (PID: $VIEWER_PID)${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Unisynth is running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 To start the mobile app:"
echo "   cd $DIR/mobile"
echo "   npm install (if first time)"
echo "   npm start"
echo ""
echo "🌐 Backend API: http://localhost:3000"
echo "🎮 3D Viewer: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $VIEWER_PID; exit 0" INT
wait
