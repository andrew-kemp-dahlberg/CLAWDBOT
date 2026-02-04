# Multi-Model Routing for OpenClaw

*Research by Clawdbot subagent | 2026-02-03*
*Confidence: 85% on architecture, 90% on API setup steps, 70% on model-task matching (changes fast)*

---

## TL;DR

OpenClaw already supports multi-model fallback natively. You need:
1. A Google Gemini API key (free tier available)
2. An OpenAI API key (prepaid credits, start with $5)
3. A few lines in `~/.openclaw/openclaw.json`
4. Environment variables in `~/.openclaw/.env`

That's it. No code changes. The framework handles failover automatically.

---

## 1. Getting API Keys

### Google Gemini API Key

**Time: ~3 minutes. Free tier available.**

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Log in with your Google account
3. Accept the Terms of Service (first-time popup)
4. Click **"Get API Key"** in the bottom-left sidebar
5. Click **"Create API Key"** -- either pick an existing Google Cloud project or create a new one
6. Copy the key immediately (starts with `AIza`)
7. Store it somewhere safe -- it's only shown once

That's it. The free tier gives you enough for testing. For production load, you'd eventually move to Vertex AI, but the AI Studio key works fine for what we're doing.

**Docs:** https://ai.google.dev/gemini-api/docs/api-key

### OpenAI API Key

**Time: ~5 minutes. Requires payment method.**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account (or log in) -- this is separate from your ChatGPT account
3. Verify email + phone number (SMS verification required)
4. Go to **Settings > Billing** and add a payment method
5. Add credits -- **start with $5**, that's plenty for testing. Each API call is fractions of a cent for simple stuff
6. Set a monthly spending limit under **Settings > Limits** (do this, seriously)
7. Go to **Settings > API Keys** (or [platform.openai.com/api-keys](https://platform.openai.com/api-keys))
8. Click **"Create new secret key"**
9. Name it something like "openclaw-clawdbot"
10. Copy the key immediately -- only shown once

**Docs:** https://platform.openai.com/docs/quickstart

### Anthropic (Already Working)

You've already got this one. For reference, the env var is `ANTHROPIC_API_KEY`. If you ever need to rotate it: [console.anthropic.com](https://console.anthropic.com)

---

## 2. How OpenClaw Already Supports Model Fallbacks

This is the good news. OpenClaw has this built in. The architecture works like this:

### The Fallback Chain

```
Primary Model (e.g., Claude Sonnet 4.5)
    │
    ├── Rate limit / timeout / auth error?
    │
    ▼
Fallback 1 (e.g., Gemini 3 Pro)
    │
    ├── Also failing?
    │
    ▼
Fallback 2 (e.g., GPT-5.2)
    │
    ├── Also failing?
    │
    ▼
Error returned to user
```

### How It Works Under the Hood

1. **Primary attempt** -- OpenClaw tries your primary model using the standard auth resolution flow
2. **Failure detection** -- If the primary fails (rate limit, auth error, timeout), OpenClaw marks that auth profile in cooldown
3. **Fallback cascade** -- Tries the next model in the fallback list
4. **Cross-provider resilience** -- If Anthropic is rate-limited, ALL Anthropic models might be slow. Falling back to Google or OpenAI keeps you running because it's a completely different provider

### Auth Resolution Order

OpenClaw resolves credentials in this order:
1. Auth profiles (configured via `openclaw onboard`)
2. Environment variables (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`)
3. Explicit config in `models.providers.*.apiKey`

### Configuration

In `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "google-genai/gemini-3-pro-preview",
          "openai/gpt-5.2"
        ]
      }
    }
  }
}
```

### CLI Shorthand

You can also manage fallbacks without editing JSON:

```bash
openclaw models fallbacks list
openclaw models fallbacks add google-genai/gemini-3-pro-preview
openclaw models fallbacks add openai/gpt-5.2
openclaw models fallbacks remove <provider/model>
```

---

## 3. Load Balancer Pattern for Multi-Model Routing

The fallback chain above is reactive -- it only switches when something breaks. A load balancer pattern is proactive -- it routes tasks to the right model before anything breaks.

### Architecture: Task-Aware Router

```
Incoming Message / Task
        │
        ▼
   ┌─────────────┐
   │  CLASSIFIER  │  ← Determines task type + complexity
   └──────┬──────┘
          │
    ┌─────┼──────────────────┐
    ▼     ▼                  ▼
 COMPLEX  STANDARD        SIMPLE
    │       │                │
    ▼       ▼                ▼
 Claude   GPT-5.2        Gemini Flash
 Opus 4.5  or Claude      (cheapest,
 (heavy    Sonnet 4.5     fastest)
  lift)    (balanced)
```

### Implementation Options

**Option A: OpenRouter Auto (Easiest)**

OpenRouter has an auto-routing model that does this for you:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/openrouter/auto",
        "fallbacks": [
          "anthropic/claude-sonnet-4-5"
        ]
      }
    }
  }
}
```

OpenRouter's auto model selects the most cost-effective model based on your prompt. Simple tasks (heartbeats, status checks) get routed to cheap models. Complex tasks get routed to frontier models. You pay per-token through OpenRouter.

**Pros:** Zero config, smart routing, cost savings of ~50%+
**Cons:** Another dependency, slight latency from the proxy, less control

**Option B: Per-Agent Model Assignment (More Control)**

Run multiple agents in the same gateway, each with a different model:

```json
{
  "agents": {
    "list": [
      {
        "id": "heavy",
        "name": "Deep Thinker",
        "workspace": "~/.openclaw/workspace-heavy",
        "model": {
          "primary": "anthropic/claude-opus-4-5"
        }
      },
      {
        "id": "fast",
        "name": "Quick Response",
        "workspace": "~/.openclaw/workspace-fast",
        "model": {
          "primary": "google-genai/gemini-3-flash"
        }
      }
    ]
  }
}
```

Then use OpenClaw's routing bindings to direct different channels/conversations to different agents.

**Option C: Heartbeat on Cheap, Conversation on Premium**

The most practical pattern for us right now:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "google-genai/gemini-3-pro-preview",
          "openai/gpt-5.2",
          "google/gemini-flash-1.5-8b:free"
        ]
      },
      "heartbeat": {
        "model": "google/gemini-flash-1.5-8b:free"
      }
    }
  }
}
```

This keeps Claude for actual conversations but uses the free Gemini Flash for periodic heartbeat checks. Heartbeats run every 30 minutes -- that's 48 API calls per day you're not paying Claude prices for.

---

## 4. Which Model for Which Task

### The Routing Matrix

| Task Type | Best Model | Why | Fallback |
|-----------|-----------|-----|----------|
| **Deep reasoning / analysis** | Claude Opus 4.5 | Highest SWE-bench (80.9%), maps dependencies before solving, fewer hallucinations on long context | GPT-5.2 |
| **Code generation / review** | Claude Sonnet 4.5 | Best coding benchmarks, architectural planning approach, clean maintainable output | GPT-5.2 |
| **Math / abstract reasoning** | GPT-5.2 | 52.9% ARC-AGI-2, 100% AIME 2025, 65% fewer hallucinations than GPT-4o | Claude Opus 4.5 |
| **Creative writing** | GPT-5.2 | Most human-like text, varied tone and style | Claude Sonnet 4.5 |
| **Long document processing** | Claude Opus 4.5 | Maintains reasoning quality past 50K tokens, effective use of full context window | Gemini 3 Pro |
| **Multimodal (images/video/audio)** | Gemini 3 Pro | Native multimodal, not bolted-on. Understands diagrams, screenshots, mixed-media | GPT-5.2 |
| **Massive context (>200K tokens)** | Gemini 3 Pro | 1M-2M token context window, 180 tokens/sec generation | Claude Opus 4.5 |
| **Quick responses / high volume** | Gemini 3 Flash | Fastest generation, cheapest, "Pro-level intelligence at Flash pricing" | Gemini 3 Pro |
| **Heartbeats / status checks** | Gemini Flash 1.5 8B (free) | Literally free. Good enough for "anything need attention?" checks | Gemini 3 Flash |
| **Security-sensitive tasks** | Claude (any) | 4.7% prompt injection success rate vs Gemini 12.5% vs GPT 21.9% | GPT-5.2 |
| **Google ecosystem integration** | Gemini 3 Pro | Deep Workspace integration, under an hour to set up | N/A |

### For Clawdbot Specifically

Given what we're building -- a truth-seeking agent system with memory, epistemological structure, and multi-agent coordination -- here's the practical routing:

- **Primary (conversations, reasoning, code):** Claude Sonnet 4.5 or Opus 4.5
  - Why: Best at following complex system prompts (like our CLAUDE.md), lowest prompt injection rate, best long-context reasoning
- **Fallback 1 (when Claude is down):** GPT-5.2
  - Why: Strong reasoning, good code, reliable uptime
- **Fallback 2 (when everything is expensive):** Gemini 3 Pro
  - Why: Massive context window, fast, good enough for most tasks
- **Background tasks (heartbeats, monitoring):** Gemini Flash (free tier)
  - Why: Free. Runs 48 times a day without costing a cent

---

## 5. Environment Setup

### The .env Template

Create or edit `~/.openclaw/.env`:

```bash
# ===================================
# OpenClaw Multi-Model API Keys
# ===================================

# Anthropic (Claude) - Primary
# Get key: https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Google (Gemini) - Fallback 1
# Get key: https://aistudio.google.com → Get API Key
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (GPT) - Fallback 2
# Get key: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Optional: OpenRouter (for auto-routing)
# Get key: https://openrouter.ai/keys
# OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
```

### The openclaw.json Config

Add to `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "google-genai/gemini-3-pro-preview",
          "openai/gpt-5.2",
          "google/gemini-flash-1.5-8b:free"
        ]
      }
    }
  }
}
```

### Quick Verification

After setting up:

```bash
# Check your config is valid
openclaw doctor

# Verify model access
openclaw models fallbacks list

# Check all channels/connections
openclaw channels status
```

---

## 6. Cost Reality Check

Rough monthly estimates at moderate use (~100 conversations/day):

| Provider | Model | Cost Estimate | Notes |
|----------|-------|---------------|-------|
| Anthropic | Claude Sonnet 4.5 | $15-40/mo | Primary, most calls |
| Google | Gemini Flash (free) | $0 | Heartbeats only |
| Google | Gemini 3 Pro | $5-15/mo | Fallback, occasional use |
| OpenAI | GPT-5.2 | $5-15/mo | Fallback, occasional use |
| **Total** | | **$25-70/mo** | With smart routing |

Without routing (Claude for everything): $40-100/mo. Smart routing saves ~40-50%.

Start with $5 credits on OpenAI. The Gemini free tier handles testing. Scale up only when you see real usage patterns.

---

## 7. What's Next

1. **Drew gets the API keys** (Google: 3 min, OpenAI: 5 min)
2. **Add them to `~/.openclaw/.env`**
3. **Update `openclaw.json` with the fallback config above**
4. **Run `openclaw doctor` to verify**
5. **Test by temporarily killing the Anthropic key** and seeing if fallback kicks in

Future improvements:
- OpenRouter auto-routing for cost optimization
- Per-agent model assignment for specialized tasks
- Local model fallback (Ollama) for offline/private use
- Custom routing rules based on task classification

---

## Sources

- [Google AI Studio - API Key Setup](https://ai.google.dev/gemini-api/docs/api-key)
- [OpenAI Platform - Developer Quickstart](https://platform.openai.com/docs/quickstart)
- [OpenClaw Configuration Docs](https://docs.openclaw.ai/gateway/configuration)
- [OpenClaw Multi-Model Routing Guide (VelvetShark)](https://velvetshark.com/openclaw-multi-model-routing)
- [OpenClaw API Cost Optimization](https://zenvanriel.nl/ai-engineer-blog/openclaw-api-cost-optimization-guide/)
- [OpenRouter + OpenClaw Integration](https://openrouter.ai/docs/guides/guides/openclaw-integration)
- [GPT vs Claude vs Gemini Comparison 2026 (Jenova AI)](https://www.jenova.ai/en/resources/gpt-vs-claude-vs-gemini)
- [AI Model Benchmarks Jan 2026 (LM Council)](https://lmcouncil.ai/benchmarks)
- [Best AI Models 2026 (HumAI)](https://www.humai.blog/best-ai-models-2026-gpt-5-vs-claude-4-5-opus-vs-gemini-3-pro-complete-comparison/)
