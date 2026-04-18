#!/bin/bash
# AuraJonad — Push to GitHub
# Run: bash push.sh

git init
git branch -M main
git remote add origin git@github.com:youssefnader30-stack/aura-jonad-shop.git

git add -A
git reset -- .env.local

git commit -m "feat: AuraJonad ecom-build — full codebase (Waves 1-4)"
git push -u origin main --force

echo ""
echo "Done! Repo: https://github.com/youssefnader30-stack/aura-jonad-shop"
