# 🚀 Railway Deployment Guide

Step-by-step guide para i-deploy ang Discord bot mo sa Railway for 24/7 hosting.

## Pre-requisites

1. ✅ GitHub account
2. ✅ Discord bot token (from SETUP.md)
3. ✅ Railway account (free tier available)

## Step 1: Create GitHub Repository

1. **Create new repository** sa GitHub:
   - Go to github.com
   - Click "New repository" 
   - Name: `discord-song-bot` (or any name you want)
   - Set to Public or Private
   - Don't initialize with README (we already have one)

2. **Upload your code** using VS Code:
   ```bash
   # Initialize git in your project folder
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - Discord Song Bot"
   
   # Add your GitHub repo as origin
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Railway

1. **Sign up sa Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub account

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Discord bot repository

3. **Configure environment variables**:
   - Sa Railway dashboard, go to your project
   - Click "Variables" tab
   - Add new variable:
     - Name: `DISCORD_TOKEN`
     - Value: `your_actual_discord_bot_token`

4. **Deploy**:
   - Railway will automatically detect Node.js
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete

## Step 3: Monitor Deployment

1. **Check logs**:
   - Sa Railway dashboard, click "Deployments"
   - View logs to see if bot started successfully
   - Look for: "✅ Bot is online as [BotName]!"

2. **Test the bot**:
   - Go to your Discord server
   - Type a song title to test
   - Bot should respond with PDF

## Step 4: Domain & Monitoring (Optional)

1. **Custom domain** (if needed):
   - Railway provides a random URL
   - You can add custom domain in settings

2. **Keep bot alive**:
   - Railway automatically keeps your bot running
   - Free tier has monthly usage limits
   - Upgrade to Pro for unlimited usage

## Troubleshooting

### Common Issues:

**❌ "TokenInvalid" error**
- Check if DISCORD_TOKEN is correctly set in Railway
- Ensure token is copied correctly (no extra spaces)

**❌ Bot not responding**
- Check Railway logs for errors
- Ensure bot has proper permissions in Discord
- Verify Message Content Intent is enabled

**❌ PDF generation errors**
- Check if all dependencies installed correctly
- Monitor Railway logs for specific error messages

**❌ Deployment failed**
- Ensure package.json has correct Node.js version
- Check if all files are committed to GitHub

### Railway Commands:
```bash
# To redeploy manually
git add .
git commit -m "Update bot"
git push origin main
# Railway will auto-deploy
```

## Free Tier Limits

Railway free tier includes:
- 512MB RAM
- 1GB disk space  
- $5/month free usage
- Auto-sleep after inactivity

For 24/7 operation without limits, consider upgrading to Railway Pro.

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | ✅ Yes |
| `NODE_ENV` | `production` | ❌ Optional |

## Next Steps

1. ✅ Bot is now running 24/7 on Railway
2. 🎵 Test all features in Discord
3. 📚 Add more songs to your database
4. 🔄 Update code by pushing to GitHub (auto-deploys)

Your Discord bot is now live and running 24/7! 🎉
