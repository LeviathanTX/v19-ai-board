#!/bin/bash

echo "🚀 Deploying CORS fix with updated AIHub..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix CORS: Use API proxy at /api/claude instead of direct Anthropic calls"
git push origin main

echo "✅ Done! The AI Hub now uses the proxy to avoid CORS errors."
echo "📊 Check deployment at: https://vercel.com/jeff-levines-projects/v19-ai-board"