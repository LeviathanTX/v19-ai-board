#!/bin/bash

echo "🚀 Fixing localStorage quota issue..."

cd /Users/jeffl/Desktop/v19-ai-board

git add .
git commit -m "Fix localStorage quota error - remove document content from storage"
git push origin main

echo "✅ Done! Documents will now save without filling up localStorage"
echo "Added 'Clear All Data' button in Settings for users to reset if needed"