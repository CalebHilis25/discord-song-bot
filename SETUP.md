# Discord Bot Setup Instructions

## Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Give it a name (e.g., "Song Bot")
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the TOKEN

## Step 2: Bot Permissions

In the Bot section, enable these:
- MESSAGE CONTENT INTENT ✅
- SERVER MEMBERS INTENT (optional)
- PRESENCE INTENT (optional)

## Step 3: Invite Bot to Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - Send Messages
   - Attach Files
   - Read Message History
   - Use Slash Commands (optional)
4. Copy the generated URL
5. Open URL and invite bot to your server

## Step 4: Environment Setup

1. Copy `.env.example` to `.env`
2. Add your bot token:
   ```
   DISCORD_TOKEN=your_actual_token_here
   ```

## Step 5: Install and Run

```powershell
npm install
npm start
```

## Usage Examples

- Type: `sample song` → Bot sends PDF with lyrics and chords
- Type: `!help` → Shows help message
- Type: `!list` → Shows available songs

## Adding Your Own Songs

Edit `songDatabase.js` or add JSON files to `/songs/` folder.

**IMPORTANT**: Only add songs you have legal rights to use!
