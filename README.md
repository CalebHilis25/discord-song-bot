# 🎵 Discord Song Bot

A Discord bot that provides song lyrics with chords and generates downloadable PDF files in a 2-column format.

## ✨ Features

- 📝 **Manual Lyrics Processing** - Paste complete lyrics with chords
- 📎 **.txt File Support** - Upload lyrics files directly
- 📄 **PDF Generation** - Microsoft Word-style columns with lyrics and chords
- 📥 **Auto Download** - Ready-to-download PDF files
- 🎨 **Professional Format** - Bold titles, proper spacing, 11pt font
- ⚡ **Real-time Response** - Instant Discord integration
- 🔄 **Chord Transposition** - Change keys after PDF generation
- 💡 **Interactive Flow** - Guided title and artist input

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

### Replit Deployment (24/7 Hosting)

1. **Import from GitHub** to Replit
2. **Add Discord token** using Replit Secrets
3. **Run automatically** in Replit workspace 🚀

## 📖 Usage

### Discord Commands

- **Paste Lyrics**: Simply paste complete song lyrics with chords
- **Upload .txt File**: Attach a .txt file with lyrics and chords
- **Help**: `!help` - Show available commands and usage instructions
- **Version**: `!version` - Check bot version and features
- **Cancel**: `!cancel` - Cancel current song processing
- **Test**: `!test [lyrics]` - Test if input looks like lyrics

### Example Workflow
When you paste lyrics or upload a .txt file:
1. Bot validates the input contains lyrics and chords
2. Bot asks for the song title
3. Bot asks for the artist name
4. Bot generates a professional PDF with your content
5. Bot sends the PDF as a Discord attachment
6. Bot offers chord transposition options
7. Format: Microsoft Word-style columns, bold titles, proper spacing

**Manual Input Features:**
- Processes pasted lyrics with chord notations
- Supports .txt file uploads
- Custom song title and artist input
- Chord transposition capabilities
- No web searching - lyrics provided by user

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

### Replit (Recommended for 24/7 hosting)

1. **Import to Replit**:
   - Import your GitHub repo to Replit
   - Install dependencies automatically
   - `start` script is defined in `package.json`

2. **Configure in Replit**:
   - Add `DISCORD_TOKEN` using Replit Secrets
   - Bot workflow will start automatically
   - Replit handles environment setup

3. **Monitor your bot**:
   - Check Replit console logs for any issues
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
