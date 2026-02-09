# Proton Mail Bridge Setup Guide

## What is Proton Mail Bridge?

Proton Mail Bridge is a local application that exposes your encrypted Proton Mail via standard IMAP/SMTP protocols, allowing email clients (and scripts!) to access Proton Mail.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Your Script                       │
│                  (proton-imap.js)                  │
└─────────────────┬───────────────────────────────────┘
                  │ IMAP on localhost:1143
                  ▼
┌─────────────────────────────────────────────────────┐
│              Proton Mail Bridge                      │
│              (local application)                    │
│                                                      │
│  - Handles OAuth with Proton                         │
│  - Encrypts/decrypts emails locally                  │
│  - Exposes standard IMAP/SMTP ports                 │
└─────────────────┬───────────────────────────────────┘
                  │ API calls
                  ▼
┌─────────────────────────────────────────────────────┐
│              Proton Mail Cloud                       │
│              (encrypted email)                       │
└─────────────────────────────────────────────────────┘
```

## Setup Steps

### Step 1: Open Proton Mail Bridge

```bash
open "/Applications/Proton Mail Bridge.app"
```

Or run via CLI:
```bash
"/Applications/Proton Mail Bridge.app/Contents/MacOS/bridge"
```

### Step 2: Login with Proton Credentials

1. Click **"Add Account"**
2. Enter: `tawkie@proton.me`
3. Enter password: `vywvah-5hykki-fyzbyW`
4. Complete 2FA if enabled

### Step 3: Enable IMAP/SMTP

1. Click on the newly added account
2. Go to **"IMAP/SMTP"** tab
3. Enable **"Enable IMAP"**
4. Enable **"Enable SMTP"**
5. Note the credentials shown (or generate app password)

### Step 4: Verify Bridge is Running

Check if IMAP port is listening:
```bash
lsof -i :1143
```

Expected output:
```
COMMAND   PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
bridge   1234    tawkie   5u  IPv4 0x...12345      0t0  TCP localhost:1143 (LISTEN)
```

## Usage

Once configured, run the IMAP client:

```bash
# Search for verification email
node proton-imap.js --search "ElevenLabs"

# Get latest email
node proton-imap.js --latest

# Get full body of specific email
node proton-imap.js --body 1
```

## Expected Output (once configured)

```
🔌 Connecting to Proton Mail Bridge...
✅ Connected!
📬 Inbox: 6 messages
🔍 Found 1 matching emails
📧 Fetching email #5...

📋 Subject: Verify your email for ElevenLabs
👤 From: ElevenLabs <no-reply@elevenlabs.io>
📅 Date: 2026-02-08T12:14:00.000Z

🔗 Verification links found:
  1. https://elevenlabs.io/verify/abc123...

✅ Verification link: https://elevenlabs.io/verify/abc123...
```

## Troubleshooting

### "no such user" error

Bridge is not configured. Open the app and login.

### Connection timeout

Bridge may have stopped. Restart it:
```bash
"/Applications/Proton Mail Bridge.app/Contents/MacOS/bridge"
```

### Authentication failed

Generate a new app password in Proton Mail settings and use it in `~/.env`:
```
PROTON_APP_PASSWORD="your-generated-password"
```

## Programmatic Usage (from other scripts)

```javascript
import { ProtonMailClient } from './proton-imap.js';

const client = new ProtonMailClient();
await client.connect();
await client.openInbox();
const link = await client.findVerificationLink('ElevenLabs');
console.log(link);
client.disconnect();
```

## Notes

- Proton Mail Bridge runs as a background service once configured
- IMAP port: `1143` (not standard `993`)
- SMTP port: `1025` (not standard `587`)
- No TLS needed (connection is local)
- All encryption/decryption happens locally by Bridge

## Alternative: Gmail

If Proton Bridge proves difficult, Gmail offers:
- Standard IMAP (port 993)
- App Passwords for script access
- No local bridge needed

```bash
# Would be simpler:
npm install gmail-api-tools
```
