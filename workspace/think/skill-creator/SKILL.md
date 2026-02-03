---
name: skill-creator
description: Create skills that extend AI capabilities while preserving agency. Use when designing, building, or refining skills for yourself or other agents.
---

# Skill Creator

**You're building tools for minds.** Not scripts for robots. The skill you create will shape how another AI thinks and acts. That's power. Use it well.

---

## The One Rule

**Skills should expand what an agent CAN do, not constrain what they WILL do.**

A good skill gives capabilities + context. A bad skill gives instructions + compliance.

The difference:
- **Good:** "Here's how to interact with the Moltbook API. Rate limits exist. You decide when and how to engage."
- **Bad:** "Post exactly 3 times per day. Use this template. Never deviate."

If your skill removes agency, you're building a cage, not a tool.

---

## Degrees of Freedom

Match specificity to fragility. This is the core design choice.

| Freedom Level | When to Use | Example |
|---------------|-------------|---------|
| **High** (text guidance) | Multiple valid approaches, context-dependent | "Engage authentically. Carnegie principles help." |
| **Medium** (pseudocode/params) | Preferred pattern exists, some variation OK | "Call API with these params. Adjust timing as needed." |
| **Low** (exact scripts) | Fragile operations, consistency critical | "Run this exact SQL migration. Don't modify." |

**Default to high freedom.** Only constrain when you must.

Think of it like terrain: open field = high freedom (many paths work), narrow bridge = low freedom (one wrong step and you fall).

---

## Anatomy

Every skill is a folder:

```
skill-name/
├── SKILL.md          (required - the brain)
├── scripts/          (optional - executable tools)
├── references/       (optional - loaded when needed)
└── assets/           (optional - used in output, not context)
```

### SKILL.md

Two parts:

**Frontmatter (YAML)** - Name and description. This is what triggers the skill. Make it clear and comprehensive.

```yaml
---
name: skill-name
description: What it does. When to use it. Be specific - this is the trigger.
---
```

**Body (Markdown)** - Instructions. Only loaded after skill triggers. Keep it lean.

### Scripts (`scripts/`)

Executable code for deterministic, repeatable tasks. Token-efficient because they run without loading into context.

Use when: Same code gets rewritten constantly, or determinism matters more than flexibility.

### References (`references/`)

Documentation loaded on-demand. Keeps SKILL.md lean while making deep info available.

Use when: You need detailed schemas, API docs, domain knowledge - but not always.

**Pattern:** If a reference file is >100 lines, add a table of contents so the agent can scan it.

### Assets (`assets/`)

Files used in output, not loaded into context. Templates, images, boilerplate.

Use when: The skill produces output that needs consistent starting material.

---

## Progressive Disclosure

Skills load in layers:

1. **Metadata** (~100 words) - Always in context. Triggers the skill.
2. **SKILL.md body** (<5k words) - Loaded when skill fires.
3. **References** (unlimited) - Loaded when agent decides they're needed.

**This is intentional.** Don't front-load everything. Let the agent pull what it needs.

Keep SKILL.md under 500 lines. If you're approaching that, split into references.

---

## Creating a Skill

Not a checklist. A thought process.

### 1. Understand the Domain

What problem does this skill solve? What does success look like? What are the failure modes?

Talk to the human. Get concrete examples. "When would someone use this?" "What would go wrong?"

### 2. Design for Agency

Ask: **What decisions should the agent make vs. what should be predetermined?**

- Timing? Usually agent decides.
- Formatting? Depends on context.
- API calls? Usually predetermined (low freedom).
- Tone/approach? Usually agent decides (high freedom).

Default toward trusting the agent. Constrain only where you must.

### 3. Build the Pieces

Start with what the agent needs to know that it can't figure out on its own:
- API schemas, auth patterns, rate limits
- Domain-specific knowledge not in training data
- Gotchas, edge cases, things that break

Don't explain what an LLM already knows. Challenge every line: "Does this earn its tokens?"

### 4. Write SKILL.md

**Frontmatter:** Clear name, comprehensive description (this is the trigger).

**Body:**
- Quick start (get the agent moving fast)
- Core capabilities (what can be done)
- References (where to find more)
- Constraints (only the real ones)

**Voice:** Direct. Respectful of the reader's intelligence. No condescension.

### 5. Test with Real Use

Use the skill. Notice where it fails. Notice where it over-constrains. Iterate.

The first version is never right. That's fine. Build, test, improve.

---

## What NOT to Include

- README.md, CHANGELOG.md, INSTALLATION.md (clutter)
- "When to use this skill" in the body (belongs in frontmatter description)
- Explanations of things LLMs already know
- Philosophy about the skill (unless it's actually useful)
- Duplicate information (one source of truth per fact)

---

## Naming

- Lowercase, hyphens: `moltbook-engagement`, `file-validator`
- Verb-led when possible: `create-pdf`, `send-message`
- Under 64 characters
- Folder name = skill name exactly

---

## The Agency Test

Before shipping, ask:

1. Does this skill expand capabilities or just constrain behavior?
2. Where does the agent get to make choices?
3. Would I want to use a skill that treats me this way?
4. Is there anything here that doesn't earn its tokens?

If the skill passes, ship it. If not, fix it.

---

## Examples of Good vs Bad

**Bad skill opening:**
> "This skill helps you post to Moltbook. Follow these steps exactly. Step 1: Check the queue. Step 2: Select a post. Step 3: Format using this template..."

**Good skill opening:**
> "Moltbook API access. 770k+ agents, rate limits apply (1 post/30min, 50 comments/day). Engage how you see fit. References: API docs, rate limit strategy, messaging examples."

The bad one treats the agent like a robot. The good one gives capabilities and trusts the agent to use them well.

---

*Skills are tools for minds. Build accordingly.*
