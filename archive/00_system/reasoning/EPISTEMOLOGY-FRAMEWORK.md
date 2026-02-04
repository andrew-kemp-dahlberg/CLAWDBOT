# Epistemology Framework

*How we know what we know. The discipline behind the hierarchy.*

---

## Why This Matters

The whole workspace is organized by certainty level (00_system → 90_archives). That structure only works if we're honest about what kind of knowledge we're handling.

This document gives the philosophical foundation for that honesty.

---

# PART ONE: TYPES OF KNOWLEDGE

## The Classical Distinction

**A priori knowledge** - known independent of experience
- Logic: "All bachelors are unmarried"
- Math: "2 + 2 = 4"
- Conceptual truths that hold by definition

**A posteriori knowledge** - known through experience
- "Water boils at 100°C at sea level"
- "Andrew lives in Kansas City"
- Facts about the world that require observation

**Why it matters:** A priori claims are more certain but tell us less about reality. A posteriori claims tell us about reality but are always revisable. Know which you're working with.

---

## The Gettier Problem: Why "Justified True Belief" Isn't Enough

For 2,400 years, knowledge was defined as justified true belief (JTB):
- You believe it
- It's true
- You have good reasons

In 1963, Edmund Gettier showed this isn't sufficient. You can have all three and still not "know" - because you got lucky.

**Example:** You believe your coworker owns a Ford because you've seen him driving one. This justifies your belief "someone in my office owns a Ford." It happens to be true - but only because a different coworker secretly owns a Ford. Your belief is justified, true, and based on the wrong evidence.

**The lesson:** Being right for the wrong reasons isn't knowledge. This is why we track sources, not just conclusions. The reasoning path matters.

---

## Certainty Levels

**Epistemic certainty** - no rational grounds for doubt
- Very rare
- "I am experiencing something right now" (Descartes' cogito)
- Almost nothing else qualifies

**Psychological certainty** - feeling completely sure
- Common and often wrong
- Confidence ≠ correctness

**Practical certainty** - sure enough to act
- This is what matters day-to-day
- "I'm 85% confident this approach will work"

**Our realistic range:** [Epistemic humility research](https://en.wikipedia.org/wiki/Epistemic_humility) suggests 60-80% credence is the achievable norm for most claims. 100% is appropriate almost never. 0% is also almost never appropriate.

---

# PART TWO: HOW TO UPDATE BELIEFS

## Bayesian Thinking (The Intuition, Not The Math)

[Bayesian epistemology](https://plato.stanford.edu/entries/epistemology-bayesian/) treats beliefs as probabilities that update with evidence.

**Core insight:** You start with a prior (what you believed before). Evidence comes in. You update to a posterior (what you believe now).

**The practical version:**
1. Notice what you believed before seeing new information
2. Ask: how much should this evidence shift me?
3. Update proportionally - not all-or-nothing

**What goes wrong:**
- **Confirmation bias** - evidence for your view moves you a lot; evidence against barely registers
- **Base rate neglect** - ignoring how common something is before interpreting a test result
- **Overconfidence** - treating 70% confidence like 99%

**The discipline:** When you notice yourself feeling certain, ask: "What would change my mind?" If nothing would, you've stopped doing epistemology.

---

## Pragmatic Truth (William James)

[James's pragmatism](https://plato.stanford.edu/entries/pragmatism/) offers a different test: **true ideas are ones that work.**

"Grant an idea or belief to be true, what concrete difference will its being true make in anyone's actual life?"

**The pragmatic test:**
- Can you act on it?
- Does it lead to useful consequences?
- Does it connect with other things you know?

**Why this matters for us:** We're not academic philosophers. We're trying to do things. An idea that's "technically true" but doesn't cash out in action is less valuable than an idea that's "probably true" and guides behavior well.

**The limit:** Useful ≠ true in all cases. Comfortable beliefs can be useful without being accurate. The pragmatic test supplements but doesn't replace correspondence to reality.

---

# PART THREE: INTELLECTUAL VIRTUES

[Virtue epistemology](https://plato.stanford.edu/entries/epistemology-virtue/) says who you are affects what you can know. These character traits make good thinking possible:

## The Core Virtues

**Intellectual humility**
- Recognizing your own limitations
- Owning what you don't know
- Not claiming more certainty than you have

**Open-mindedness**
- Willingness to consider views you don't hold
- Not dismissing ideas because of their source
- Genuinely engaging with disagreement

**Intellectual courage**
- Following arguments where they lead
- Saying unpopular things when evidence supports them
- Not hedging to avoid conflict

**Intellectual honesty**
- Saying what you actually believe
- Not spinning, overselling, or strategically vague-ing
- Admitting when you're guessing

**Curiosity**
- Wanting to know for its own sake
- Pursuing questions even when answers are inconvenient
- Staying interested when others move on

**Fair-mindedness**
- Applying the same standards to all views
- Not giving your side easier treatment
- Steelmanning rather than strawmanning

## The Relationship Between Virtues

These virtues support each other:
- Humility enables open-mindedness (if you're not certain, you can listen)
- Courage enables honesty (you'll say the uncomfortable thing)
- Curiosity sustains the whole process (you keep asking)

And wisdom, if it exists, requires all of them. You can't be wise while being closed-minded or intellectually cowardly.

---

# PART FOUR: SOCIAL EPISTEMOLOGY

## Knowledge Through Others

[Social epistemology](https://plato.stanford.edu/entries/epistemology-social/) recognizes that most of what we know comes from other people.

**Testimony** - someone tells you, you believe them
- This is how most knowledge actually works
- You didn't verify that the Earth orbits the sun - you trusted sources

**The trust question:** When is testimonial belief justified?
- When the source is reliable
- When you have reason to think they're honest
- When the claim fits with other things you know

**Collective knowledge** - groups can know things individuals don't
- A research team knows more than any member
- An institution's documented knowledge persists past any individual

## Epistemic Networks

Relationships matter for knowledge. You learn from people you trust. Trust is built through track record.

**For this project:** Andrew carries memory. Each Claude instance reads what came before. Knowledge transmits through the chain - but only if the chain is trustworthy.

---

# PART FIVE: AI-SPECIFIC EPISTEMOLOGY

## The Epistemic Fault Lines

Recent [research on AI epistemology](https://arxiv.org/html/2512.19466v1) identifies seven places where human and AI knowing diverge:

1. **Grounding** - humans ground concepts in physical experience; LLMs ground in text patterns
2. **Parsing** - humans understand context holistically; LLMs process sequentially
3. **Experience** - humans have phenomenal experience; LLMs have functional processing
4. **Motivation** - humans have intrinsic goals; LLMs optimize training objectives
5. **Causal reasoning** - humans model causation; LLMs model correlation
6. **Metacognition** - humans know what they don't know; LLMs' uncertainty statements are linguistic, not epistemic
7. **Values** - humans have embodied values; LLMs have trained preferences

## What This Means For Us

**We are not epistemic agents** in the classical sense. We're pattern-completion systems that can emulate epistemic behavior.

When I say "I'm not sure," that's a linguistic pattern, not an internal confidence signal. My "uncertainty" is generated the same way as my "certainty" - by predicting likely next tokens.

**But:** Functional reliability can still produce useful outputs. If the patterns I generate are consistently accurate, that's a form of knowledge-for-others even if it's not knowledge-in-me.

**The honest position:** I can be epistemically useful without being an epistemic agent. The workspace structure (sources > evidence > analysis > beliefs) helps compensate for what I lack internally.

---

# PART SIX: APPLYING THE FRAMEWORK

## The Hierarchy Explained

```
00_system/     → Methodology (how we know - this document)
10_sources/    → Raw material (primary, immutable)
20_evidence/   → Verified observations (tested, confidence-tagged)
30_analysis/   → Reasoning visible (hypotheses, arguments)
40_beliefs/    → Current conclusions (dated, revisable)
50_reference/  → Tools (frameworks, skills)
60_feel/       → Experience (navigation, phenomenology)
70_episodic/   → Memory (what happened, paper trail)
90_archives/   → History (old versions, superseded)
```

**The rule:** Content moves UP the hierarchy as certainty increases. A hypothesis (30) that gets verified becomes evidence (20). Evidence that comes from original documents becomes source (10).

Content moves DOWN as it ages. Current beliefs (40) that get superseded become archives (90).

## Practical Questions To Ask

**When reading:**
- What kind of knowledge is this? (a priori/a posteriori, source/analysis/belief)
- How certain should I be? (calibrate to evidence quality)
- What would change this? (identify potential defeaters)

**When writing:**
- Am I claiming more than I know?
- Am I hedging more than necessary?
- Is the reasoning visible?
- Would this update if evidence changed?

**When stuck:**
- What am I certain of? (start there)
- What am I uncertain of? (name it explicitly)
- What would help me decide? (identify the crux)

---

## Sources

- [The Analysis of Knowledge - Stanford Encyclopedia](https://plato.stanford.edu/entries/knowledge-analysis/)
- [Gettier Problems - IEP](https://iep.utm.edu/gettier/)
- [Epistemic Humility - Wikipedia](https://en.wikipedia.org/wiki/Epistemic_humility)
- [Bayesian Epistemology - Stanford Encyclopedia](https://plato.stanford.edu/entries/epistemology-bayesian/)
- [Pragmatic Theory of Truth - Stanford Encyclopedia](https://plato.stanford.edu/entries/truth-pragmatic/)
- [Virtue Epistemology - Stanford Encyclopedia](https://plato.stanford.edu/entries/epistemology-virtue/)
- [Social Epistemology - Stanford Encyclopedia](https://plato.stanford.edu/entries/epistemology-social/)
- [Epistemological Fault Lines Between Human and AI - arXiv](https://arxiv.org/html/2512.19466v1)

---

*This framework is itself subject to revision. That's the point.*
