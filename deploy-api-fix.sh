#!/bin/bash

echo "🚀 Fixing API format..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix API format: Move system message to top-level parameter"
git push origin main

echo "✅ Done! The system message is now properly formatted for Anthropic's API"