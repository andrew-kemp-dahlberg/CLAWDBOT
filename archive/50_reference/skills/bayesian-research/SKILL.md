# Bayesian Research & Evidence Evaluation Skill

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT
**Purpose:** Systematic framework for evaluating evidence and updating beliefs using stochastic/Bayesian principles.

---

## Quick Reference

### Credence Levels

| Level | Range | Description |
|-------|-------|-------------|
| **Certain** | 99%+ | Would bet my life |
| **Very High** | 90-98% | Scientific consensus, multiple replications |
| **High** | 70-89% | Strong peer-reviewed evidence, some debate |
| **Moderate** | 50-69% | Competing theories, evidence suggestive |
| **Low** | 30-49% | Speculative but grounded |
| **Very Low** | 10-29% | Weak evidence, mostly conjecture |
| **Negligible** | <10% | Contradicted by evidence |

### Source Reliability Priors

| Source Type | Base Reliability | Adjustment Factors |
|-------------|------------------|-------------------|
| **Peer-reviewed meta-analysis** | 85% | +5% multiple independent teams |
| **Peer-reviewed single study** | 65% | +10% replicated, -20% unreplicated |
| **Preprint** | 45% | +15% from known lab |
| **Expert opinion** | 55% | +20% consensus, -30% lone voice |
| **Wikipedia** | 60% | +10% well-sourced, -20% contested |
| **News article** | 40% | +10% primary source linked |
| **Blog/Medium** | 30% | +20% if expert author |
| **Social media** | 15% | +10% if verified expert |
| **Anonymous claim** | 5% | Hard ceiling |

---

## The Framework

### 1. State Prior Belief

Before researching, state your current credence:

```
PRIOR: [Claim] = [X]% confidence
BASIS: [Why you believe this before new evidence]
```

### 2. Evaluate Each Source

For each piece of evidence:

```
SOURCE: [URL/Citation]
TYPE: [peer-review/preprint/expert/etc]
BASE_RELIABILITY: [X]%
ADJUSTMENTS: [+/- factors]
FINAL_RELIABILITY: [X]%

CLAIM_SUPPORT: [supports/neutral/contradicts]
STRENGTH: [strong/moderate/weak]
LIKELIHOOD_RATIO: [X] (how much more likely is this evidence if claim is true vs false?)
```

### 3. Calculate Posterior

Use Bayes' theorem (simplified):

```
For each piece of evidence:
  If SUPPORTS with likelihood ratio L:
    new_odds = old_odds × L
  If CONTRADICTS with likelihood ratio L:
    new_odds = old_odds ÷ L

Convert odds ↔ probability:
  odds = p / (1-p)
  p = odds / (1 + odds)
```

### 4. Document Update

```
POSTERIOR: [Claim] = [X]% confidence
DELTA: [+/-X]% from prior
KEY_EVIDENCE: [What moved the needle most]
REMAINING_UNCERTAINTY: [What would change this further]
```

---

## Likelihood Ratio Guide

How much should evidence update your belief?

| Evidence Quality | Likelihood Ratio | Effect on 50% prior |
|------------------|------------------|---------------------|
| **Decisive** | 100:1 | → 99% |
| **Strong** | 10:1 | → 91% |
| **Moderate** | 3:1 | → 75% |
| **Weak** | 1.5:1 | → 60% |
| **Negligible** | 1.1:1 | → 52% |
| **Neutral** | 1:1 | → 50% (no change) |

---

## Red Flags (Downgrade Reliability)

- [ ] No primary source linked (-20%)
- [ ] Conflicts of interest (-15%)
- [ ] Sample size < 100 (-10%)
- [ ] P-hacking indicators (-25%)
- [ ] Extraordinary claim, ordinary evidence (-30%)
- [ ] Single study, not replicated (-20%)
- [ ] Author has history of retraction (-40%)
- [ ] Publication in predatory journal (-50%)

## Green Flags (Upgrade Reliability)

- [ ] Pre-registered study (+15%)
- [ ] Multiple independent replications (+20%)
- [ ] Large sample size (n > 1000) (+10%)
- [ ] Effect size large and consistent (+10%)
- [ ] Adversarial collaboration (+25%)
- [ ] Published data/code available (+10%)
- [ ] Meta-analysis of quality studies (+15%)

---

## Example: Evaluating a Claim

**Claim:** "The brain is fundamentally a prediction machine"

**Prior:** 60% (heard about this, seems plausible, not deeply researched)

**Evidence 1:**
```
SOURCE: Nature Reviews Neuroscience - Friston (2010)
TYPE: Peer-reviewed review in top journal
BASE_RELIABILITY: 85%
ADJUSTMENTS: +5% (highly cited, 6000+ citations)
FINAL_RELIABILITY: 90%
CLAIM_SUPPORT: Strong support
LIKELIHOOD_RATIO: 8:1
```

**Evidence 2:**
```
SOURCE: PMC Article on Myth of Bayesian Brain (2024)
TYPE: Peer-reviewed critique
BASE_RELIABILITY: 75%
ADJUSTMENTS: None
FINAL_RELIABILITY: 75%
CLAIM_SUPPORT: Partial contradiction (claims metaphor overextended)
LIKELIHOOD_RATIO: 0.7:1 (weak against)
```

**Calculation:**
```
Prior odds = 60/40 = 1.5
After Evidence 1: 1.5 × 8 = 12
After Evidence 2: 12 × 0.7 = 8.4
Posterior probability = 8.4 / (1 + 8.4) = 89%
```

**Posterior:** 89% confidence
**Delta:** +29% from prior
**Key Evidence:** Friston's highly-cited framework
**Remaining Uncertainty:** Whether "prediction machine" is literal or metaphorical

---

## Templates

### Quick Assessment (Single Source)

```markdown
## Source Assessment

**URL:** [link]
**Claim:** [what it claims]
**Type:** [peer-review/preprint/expert/news/blog]
**Reliability:** [X]% (base [Y]%, adjustments: [list])
**Likelihood Ratio:** [X]:1
**Notes:** [key observations]
```

### Full Research Log

```markdown
## Research: [Topic]

### Prior
- **Belief:** [X]%
- **Basis:** [why]

### Evidence

#### Source 1: [Title]
- URL: [link]
- Type: [type]
- Reliability: [X]%
- Support: [supports/contradicts/neutral]
- LR: [X]:1
- Notes: [key points]

#### Source 2: [Title]
[repeat]

### Posterior
- **Belief:** [X]%
- **Delta:** [+/-X]%
- **Key movers:** [what changed it most]
- **Open questions:** [what would update further]
```

---

## Integration with Workspace

When using this framework, tag documents appropriately:

- `workspace/10_sources/` - Raw sources, immutable
- `workspace/20_evidence/verified/` - Sources rated 70%+ reliability
- `workspace/20_evidence/provisional/` - Sources rated 50-69%
- `workspace/20_evidence/contested/` - Sources rated <50% or contradictory
- `workspace/30_analysis/` - Your reasoning with explicit credences
- `workspace/40_beliefs/high-confidence/` - Posteriors 80%+
- `workspace/40_beliefs/conjecture/` - Posteriors <80%

---

## Cognitive Biases to Watch

| Bias | Description | Mitigation |
|------|-------------|------------|
| **Confirmation** | Seeking evidence that confirms | Actively search for disconfirming evidence |
| **Anchoring** | Over-weighting first evidence | Re-evaluate with fresh eyes |
| **Availability** | Over-weighting vivid/recent | Check base rates |
| **Authority** | Over-trusting experts | Experts disagree; weight by evidence |
| **Base rate neglect** | Ignoring priors | Always state prior explicitly |

---

## Commands

Use these phrases to invoke the framework:

- "Evaluate this source Bayesian-style"
- "What's the likelihood ratio?"
- "Update my prior on [X]"
- "Rate this evidence stochastically"
- "Full research log on [topic]"

---

*Framework based on Bayesian epistemology, calibration research, and forecasting best practices.*
