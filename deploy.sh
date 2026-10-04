#!/bin/bash
set -e

COMMIT_MSG="${1:-Update Dejeng recipe quiz app}"
BUILD_TIME=$(date +%s)
sed -i '' -E "s/app\.js(\?v=[0-9]+)?/app.js?v=${BUILD_TIME}/g" index.html
sed -i '' -E "s/style\.css(\?v=[0-9]+)?/style.css?v=${BUILD_TIME}/g" index.html

git add .
if git diff-index --quiet HEAD --; then
  echo "No changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

git push origin main
echo "Successfully pushed to GitHub Pages!"
