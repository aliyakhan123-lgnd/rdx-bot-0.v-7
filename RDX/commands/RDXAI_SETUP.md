# RDX Helpline AI - Setup Guide

## Overview
- **Command Name**: `rdxai`
- **Aliases**: `ai`, `rdx`, `guide`, `support`
- **Type**: Helpline/Support AI
- **Owner**: Sardar RDX
- **Features**: Command help, bot info, smart suggestions

## Features

✅ **Command Help System**
- Type `.rdxai deposit` → Get complete guide for deposit command
- Automatically detects what command you're asking about
- Shows usage, description, aliases, and category

✅ **Bot Information**
- Ask about owner, features, or bot details
- Automatic responses to common questions
- Mentions Sardar RDX as owner

✅ **Smart Command Detection**
- If user types wrong command → RDX AI detects it
- Suggests the correct command automatically
- Shows full guide for correct command

✅ **General AI Questions** (with API key)
- Answer general questions about the bot
- Help with how to use features
- Understand context and provide helpful guidance

## Setup Instructions

### Step 1: Get API Key (Optional but Recommended)
1. Go to https://console.cerebras.ai/
2. Sign up or login
3. Create API key
4. Copy key (format: `csk-xxxxxxxxxxxx`)

### Step 2: Configure API Key (Optional)
```
.setrdxaikey YOUR_API_KEY_HERE
```
Without this, helpline still works with command database!

### Step 3: Start Using
```
.rdxai how to deposit?
.ai balance command
.rdx what is the bot about?
.guide help command
```

## Usage Examples

### Ask About Command
```
.rdxai deposit
→ Shows complete deposit command guide

.ai daily
→ Shows daily reward command details

.rdx balance
→ Shows balance command info
```

### Ask About Bot
```
.rdxai who is the owner?
→ Sardar RDX

.ai what can this bot do?
→ Lists all features

.rdx je features hain?
→ Explains features (works in Urdu too!)
```

### Get Wrong Command Help
```
.rdxai wrong command
→ I was trying: "depo" but it didn't work
→ Returns: suggestion for "deposit"
```

### General Questions
```
.rdxai how to earn more coins?
.ai explain rankup system
.rdx how does bank work?
```

## Command Database

Built-in commands:
- **Economy**: balance, deposit, withdraw, daily, transfer, work, rankup, openaccount, top
- **Utility**: help, rdxai, goibot
- **Admin**: clearcache, resetdata

## Features Without API Key

Even without Cerebras API key, you get:
✓ Complete command guides
✓ Bot information answering
✓ Command suggestions
✓ Category information

## Features With API Key

With API configured:
✓ All above features
✓ Plus general questions answered by AI
✓ Natural language understanding
✓ Context-aware responses

## Commands Overview

```
.rdxai [question]     - Ask about commands or bot
.ai [message]         - Alias for rdxai
.rdx [question]       - Another alias
.guide [topic]        - Get help guide
.support [question]   - Support alias

.setrdxaikey [key]    - Admin: Set API key
```

## Troubleshooting

### Command guide not showing
- Make sure command exists in database
- Try alternative name or alias
- Check spelling

### Wrong command detection not working
- API key might be needed for advanced features
- Try basic commands first

### AI questions not answered
- Set API key: `.setrdxaikey YOUR_KEY`
- Check internet connection
- Verify API key is valid

## Owner Information

**Bot Owner**: Sardar RDX
- This is mentioned in every help response
- Built into the system

## Architecture

```
User Input
    ↓
Check if asking about command
    ↓ (Yes) → Get command details → Send guide
    ↓ (No)
Check if asking about bot info
    ↓ (Yes) → Return bot info → Send response
    ↓ (No)
Check for wrong/similar command
    ↓ (Yes) → Suggest correct command → Send guide
    ↓ (No)
If API configured → Use Cerebras AI
    ↓ (Yes) → Get AI response → Send response
    ↓ (No) → Suggest help command → Send basic response
```
