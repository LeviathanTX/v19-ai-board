#!/bin/bash

echo "🚀 Deploying all fixes..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Add document upload to AI Hub, default advisors, and state persistence"
git push origin main

echo "✅ Done! Your AI Board of Advisors is now fully functional!"
echo "📊 Check deployment at: https://vercel.com/jeff-levines-projects/v19-ai-board"