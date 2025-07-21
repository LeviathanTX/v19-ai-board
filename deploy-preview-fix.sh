#!/bin/bash

echo "🚀 Fixing document preview loading issue..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix: Document preview loading stuck - better error handling"
git push origin main

echo "✅ Done! Document preview should now handle missing content gracefully"