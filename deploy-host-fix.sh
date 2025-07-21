#!/bin/bash

echo "🚀 Fixing Meeting Host visibility..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix: Ensure Meeting Host is always visible and protected in Advisory Hub"
git push origin main

echo "✅ Done! Meeting Host should now always appear and cannot be deleted"