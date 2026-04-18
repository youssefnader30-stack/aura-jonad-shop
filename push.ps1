# AuraJonad - Push to GitHub
# Run this from the ecom-build folder: .\push.ps1

git init
git branch -M main
git remote add origin git@github.com:youssefnader30-stack/aura-jonad-shop.git

# Stage everything except secrets
git add -A
git reset -- .env.local

# Force push (overwrite the .gitignore-only commit)
git commit -m "feat: AuraJonad ecom-build full codebase Waves 1-4"
git push -u origin main --force

Write-Host ''
Write-Host 'Done! Repo: https://github.com/youssefnader30-stack/aura-jonad-shop' -ForegroundColor Green
