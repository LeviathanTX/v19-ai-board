#!/bin/bash

echo "🚀 Deploying persistence fixes..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix: Add default advisors and persist all state to localStorage"
git push origin main

echo "✅ Done! Advisors will now load by default and documents will persist across refreshes"