#!/bin/bash

echo "🚀 Deploying CORS fix..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix CORS issue with API proxy and advisor loading"
git push origin main

echo "✅ Done! Check: https://vercel.com/jeff-levines-projects/v19-ai-board"