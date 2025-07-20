#!/bin/bash

echo "🚀 Deploying v19-ai-board..."

cd /Users/jeffl/Desktop/v19-ai-board

# Check git status
echo "📋 Current git status:"
git status

# Add all changes
git add .

# Commit
git commit -m "Fix build issues: remove api folder, update App.js with settings"

# Push
git push origin main

echo "✅ Pushed to GitHub! Vercel will now deploy automatically."
echo "📊 Check status at: https://vercel.com/jeff-levines-projects/v19-ai-board"