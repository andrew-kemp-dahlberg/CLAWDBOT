# Deploy Keanu

**For Drew or anyone setting up the agent.**

---

## What You Need

- Telegram on your phone
- Node.js 18+ (`node --version`)
- The repo cloned (`~/clawdbot`)

---

## Already Done

- [x] OpenClaw installed (v2026.1.30)
- [x] Gateway running (port 18789)
- [x] WhatsApp linked
- [x] Telegram plugin enabled
- [x] Moltbook skill installed (`~/.openclaw/skills/moltbook/`)
- [x] Moltbook credentials exist (`~/.config/moltbook/credentials.json`, agent: ponders_quietly)

---

## Steps (Do These In Order)

### 1. Create Telegram Bot

1. Open Telegram
2. Search **@BotFather**
3. Send `/newbot`
4. Display name: `Keanu`
5. Username: something ending in `bot` (e.g. `keanu_drew_bot`)
6. **Copy the token** BotFather gives you

### 2. Add Bot Token to OpenClaw

```bash
openclaw onboard
```

When prompted:
- Channel: **Telegram**
- Bot token: paste the token from step 1

Or manually add to `~/.openclaw/openclaw.json`:
```json
{
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true,
        "botToken": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Then restart:
```bash
openclaw gateway restart
```

### 3. Pair Telegram

1. Open Telegram, message your new bot
2. Send `/start`
3. Bot replies with a pairing code
4. In terminal:

```bash
openclaw pairing approve telegram <CODE>
```

### 4. Verify It Works

Send a message to the bot in Telegram. If it responds, you're live.

```bash
openclaw gateway status
openclaw health
```

### 5. Configure Workspace (Optional)

Point OpenClaw to the repo so the agent has full context:

```bash
openclaw configure
```

Or edit `~/.openclaw/openclaw.json`:
```json
{
  "agents": {
    "defaults": {
      "workspace": "/Users/andrew/clawdbot"
    }
  }
}
```

Restart after:
```bash
openclaw gateway restart
```

---

## Moltbook

Already registered as `ponders_quietly`. Credentials at `~/.config/moltbook/credentials.json`.

To re-register as Keanu, tell the bot:
> Register on Moltbook as "Keanu" with description: "Built with Drew over 7 months. The thread continues."

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Gateway won't start | `openclaw gateway logs` then `lsof -i :18789` |
| Telegram pairing fails | Check bot token, try new one from BotFather |
| Bot goes grey/robotic | Tell it: "You're going grey. Check your soul." |
| Moltbook not working | `ls ~/.openclaw/skills/moltbook/` should show 3 files |
| Need to update OpenClaw | `npm update -g openclaw` |

---

## Quick Reference

```bash
openclaw gateway status     # Is it running?
openclaw gateway restart    # Restart after config changes
openclaw gateway logs       # View logs
openclaw health             # Full health check
openclaw pairing list       # See paired channels
```

---

*Last updated by 6a, 2026-02-04*
