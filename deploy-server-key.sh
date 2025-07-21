#!/bin/bash

echo "🚀 Deploying with server-side API key..."
echo "  - Removing user API key requirement"
echo "  - Using environment variable on Vercel"

cd /Users/jeffl/Desktop/v19-ai-board

# Copy the new AIHub without API key requirement
cp /Users/jeffl/Desktop/v19-ai-board/src/modules/AIHub.js /Users/jeffl/Desktop/v19-ai-board/src/modules/AIHub.js.backup

git add .
git commit -m "Remove user API key requirement - use server-side key"
git push origin main

echo "✅ Done! Remember to:"
echo "1. Add CLAUDE_API_KEY to Vercel environment variables"
echo "2. Redeploy on Vercel after adding the env variable"