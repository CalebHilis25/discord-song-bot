# 🚀 GitHub & Railway Deployment - Quick Commands

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

## Step 2: Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project → Deploy from GitHub repo
4. Select your Discord bot repository
5. Add environment variable: `DISCORD_TOKEN` = your bot token
6. Deploy automatically!

## Step 3: Updates

To update your bot after making changes:

```powershell
git add .
git commit -m "Update description"
git push origin main
```

Railway will automatically redeploy your bot!

## Need Help?

Check these files:
- `SETUP.md` - Discord bot token setup
- `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Full project documentation

Your bot is ready for 24/7 hosting! 🎉
