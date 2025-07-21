#!/bin/bash

echo "🚀 Deploying UI fixes..."
echo "  - Document preview functionality"
echo "  - Meeting Host visibility"
echo "  - Advisor consistency"

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix: Document preview and Meeting Host visibility in Advisory Hub"
git push origin main

echo "✅ Done! The document preview and Meeting Host should now work properly"