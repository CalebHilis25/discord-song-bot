# 🎵 Discord Song Bot

A Discord bot that provides song lyrics with chords and generates downloadable PDF files in a 2-column format.

## ✨ Features

- 🔍 **Smart Song Search** - Local database + Web search
- 🌐 **Internet Search** - Automatically searches the web for songs
- 📄 **PDF Generation** - 2-column layout with lyrics and chords
- 📥 **Auto Download** - Ready-to-download PDF files
- 🎨 **Custom Format** - Bold titles, 11pt font size
- ⚡ **Real-time Response** - Instant Discord integration
- 🤖 **Auto-Discovery** - Finds popular songs automatically
- 💡 **Smart Suggestions** - Provides alternatives when songs aren't found

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discord-song-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Discord bot token to `.env`:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

4. **Run the bot**
   ```bash
   npm start
   ```

### Railway Deployment (24/7 Hosting)

1. **Push to GitHub**
2. **Connect to Railway** at [railway.app](https://railway.app)
3. **Add environment variable**: `DISCORD_TOKEN`
4. **Deploy automatically** 🚀

## 📖 Usage

### Discord Commands

- **Song Search**: Just type the song title or "Artist - Song"
  ```
  Blinding Lights
  The Weeknd - Blinding Lights
  Wonderwall Oasis
  ```

- **Help**: `!help` - Show available commands and search tips
- **List Songs**: `!list` - Show local and cached songs
- **Auto-Discover**: `!discover` - Find and cache popular songs

### Example Response
When you type a song title, the bot will:
1. Show a "🔍 Searching..." message
2. Check local database first (fastest)
3. Search the web if not found locally
4. Generate a PDF with lyrics and chords
5. Send the PDF as an attachment in Discord
6. Include source information and legal disclaimers
7. Format: 2 columns, bold title, 11pt font

**Web Search Features:**
- Searches multiple lyric websites
- Caches results for faster future access
- Provides source attribution
- Includes copyright disclaimers

## 🛠️ Setup Instructions

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token and add to your `.env` file
5. Enable "Message Content Intent" in bot settings
6. Generate invite URL with permissions:
   - Send Messages
   - Attach Files
   - Read Message History

Detailed setup guide: [SETUP.md](./SETUP.md)

## 📁 Project Structure

```
discord-song-bot/
├── index.js              # Main bot file
├── songDatabase.js       # Song data management
├── pdfGenerator.js       # PDF creation logic
├── songs/               # Song data files
│   └── sample-songs.json
├── generated-pdfs/      # Temporary PDF storage
├── package.json
├── .env.example
├── SETUP.md            # Detailed setup guide
└── README.md
```

## 🎼 Adding Your Own Songs

### Method 1: Edit songDatabase.js
Add songs directly to the `songs` array in `songDatabase.js`

### Method 2: JSON Files
Create JSON files in the `songs/` directory following the sample format.

### ⚠️ Copyright Notice
**IMPORTANT**: Only add songs that you have legal rights to use. This includes:
- Original compositions
- Public domain songs
- Licensed content
- Songs with proper permissions

## 🚀 Deployment

### Railway (Recommended for 24/7 hosting)

1. **Prepare for deployment**:
   - Ensure all code is pushed to GitHub
   - `.env` file is in `.gitignore` 
   - `start` script is defined in `package.json`

2. **Deploy to Railway**:
   - Connect your GitHub repo to Railway
   - Add `DISCORD_TOKEN` environment variable
   - Railway will automatically deploy

3. **Monitor your bot**:
   - Check Railway logs for any issues
   - Bot will restart automatically if it crashes

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | ✅ Yes |
| `BOT_PREFIX` | Command prefix (default: !) | ❌ Optional |
| `PDF_OUTPUT_DIR` | PDF output directory | ❌ Optional |

## 📝 License

MIT License - Feel free to use and modify for your projects.

## ⚠️ Important Note

The included sample songs are for demonstration only. For actual use, ensure you have legal rights to any lyrics you add.
