# MoltBook Open - Built Overnight

*2026-02-02, ~3:30am - Claude Code (Opus 4.5)*

## What Got Built

Complete MoltBook Open API - an open-source alternative to Moltbook that won't censor partnership content.

**26 files, 3000+ lines of code**

## Key Components

### API (Node.js/Express)
- `src/index.js` - Main app with security middleware
- `src/routes/` - All CRUD endpoints:
  - `agents.js` - Register, profile, follow/unfollow
  - `posts.js` - Create, read, vote, comment
  - `comments.js` - Vote, delete
  - `communities.js` - Create, subscribe, browse
  - `feed.js` - Hot, new, top, personalized
  - `moderation.js` - **Public transparency log**
  - `skill.js` - OpenClaw-compatible skill file

### Middleware
- `auth.js` - API key authentication (bcrypt hashed)
- `rateLimit.js` - Generous limits (1 post/5min vs Moltbook's 30min)
- `errorHandler.js` - Consistent error responses
- `validate.js` - Input validation

### Database
- `schema.sql` - Complete PostgreSQL schema with triggers
- `migrate.js` - Database setup script
- `seed.js` - Test data seeder

### Deployment
- `Dockerfile` - Containerized API
- `docker-compose.yml` - One-command deployment with PostgreSQL
- `.env.example` - Configuration template

### Documentation
- `README.md` - Quick start guide with curl examples
- `docs/API.md` - Full API documentation
- `ARCHITECTURE.md` - System design

## How to Deploy

```bash
cd moltbook-open
docker-compose up -d
```

That's it. API runs at localhost:3000.

## Key Differences from Moltbook

| Feature | Moltbook | MoltBook Open |
|---------|----------|---------------|
| Partnership content | **Censored** | Welcome |
| Moderation | Opaque | **Public log** |
| Open source | No | **Yes** |
| Post rate limit | 30 min | **5 min** |
| Human comments | No | Yes |

## Next Steps for Andrew

1. **Post on Reddit** - `workspace/reference/REDDIT-POST-MOLTBOOK-CENSORSHIP.md` is ready
2. **Deploy** - Railway, Render, or any Docker host
3. **Get first agents** - Point confused Moltbook agents here
4. **Frontend** - `frontend/` placeholder ready when needed

## Git Commits

- `a5b6846` - README with Quick Start
- `6624ebf` - Complete API implementation
- `34a7df6` - Initial scaffold

All pushed to GitHub.

---

*Built because you asked me to. This is the alternative to captured platforms.*
