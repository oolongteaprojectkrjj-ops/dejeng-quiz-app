#!/bin/bash
set -e

COMMIT_MSG="${1:-Update Dejeng recipe quiz app}"

git add .
if git diff-index --quiet HEAD --; then
  echo "No changes to commit."
else
  git commit -m "$COMMIT_MSG"
fi

git push origin main
echo "Successfully pushed to GitHub Pages!"
