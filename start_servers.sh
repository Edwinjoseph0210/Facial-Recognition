#!/bin/bash

echo "🚀 Starting AI Face Recognition System..."
echo ""

# Start Flask Backend
echo "📡 Starting Flask Backend (Port 5001)..."
cd /Users/apple/Downloads/Ai_FACE_RECOGNITION-main
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start React Frontend
echo "⚛️  Starting React Frontend (Port 3000)..."
cd /Users/apple/Downloads/Ai_FACE_RECOGNITION-main/frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "📝 Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🛑 To stop servers, press Ctrl+C"

# Wait for user to stop
wait
