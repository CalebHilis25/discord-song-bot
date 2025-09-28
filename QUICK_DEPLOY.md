# 🚀 GitHub & Replit Deployment - Quick Commands

## Step 1: Push to GitHub

After creating your GitHub repository, run these commands:

```powershell
# Add your GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details.

## Step 2: Replit Deployment

1. Go to [replit.com](https://replit.com)
2. Sign in with GitHub
3. Import from GitHub → Select your Discord bot repository
4. Add secret: `DISCORD_TOKEN` = your bot token
5. Run automatically in Replit workspace!

## Step 3: Updates

To update your bot after making changes:

```powershell
git add .
git commit -m "Update description"
git push origin main
```

Replit will automatically update your bot!

## Need Help?

Check these files:
- `SETUP.md` - Discord bot token setup
- Replit workspace - Integrated development environment
- `README.md` - Full project documentation

Your bot is ready for 24/7 hosting! 🎉
