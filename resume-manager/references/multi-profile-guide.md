# Multi-Profile Architecture & Management Guide

## 1. Why Multi-Profile Architecture?

A single, static resume is ineffective for candidates with diverse capabilities or those seeking to transition between sectors. Attempting to cram every skill onto one resume produces a generic, confusing document that satisfies nobody:
- Technical recruiters find it diluted.
- Operational hiring managers find it intimidating and overly technical.
- Smaller companies assume the candidate is too expensive or flighty.

`resume-manager` solves this by maintaining a single master experience repository (`master_profile.md`) alongside distinct **Profile Tracks** stored under `profiles/`.

---

## 2. Standard Profile Archetypes

### Track A: `senior_technical`
- **Intended Audience:** Tech giants, high-growth startups, engineering directors, staff/principal committees.
- **Core Themes:** Distributed systems, throughput, latency, architectural decoupling, technical governance, high concurrency.
- **Tone:** Architectural authority, precise systems terminology, trade-off mastery.

### Track B: `practical_mid_technical`
- **Intended Audience:** Standard software teams, mid-market companies, departments needing dependable hands-on coders.
- **Core Themes:** Feature delivery, maintainability, clean code, unit testing, teamwork, low-drama execution.
- **Tone:** Humble, pragmatic, collaborative, hands-on.

### Track C: `operations_management`
- **Intended Audience:** Business operations, program management, logistics, process improvement.
- **Core Themes:** Compressing cycle times, eliminating manual errors, vendor coordination, cost optimization, cross-functional bridge.
- **Tone:** Business outcomes, systems precision, organizational empathy.

### Track D: `solutions_client_facing`
- **Intended Audience:** Solutions architecture, technical account management, customer engineering.
- **Core Themes:** Customer trust, translating client business requirements into technical solutions, post-sales retention, technical discovery.
- **Tone:** Communicative, consultative, empathetic, revenue-aligned.

### Track E: `adjacent_industry`
- **Intended Audience:** Healthcare, manufacturing, local government, education, supply chain.
- **Core Themes:** Dependability, pragmatic workflow automation, data integrity, respect for domain norms, long-term stability.
- **Tone:** Grounded, mission-focused, anti-flight risk, accessible.

---

## 3. Directory Layout for Profiles

```
~/.gemini/resume/ (or user-configured profiles directory)
├── master_profile.md          # Comprehensive source of truth
└── profiles/
    ├── senior_technical.md
    ├── practical_mid_technical.md
    ├── operations_management.md
    ├── solutions_client_facing.md
    └── adjacent_industry.md
```

## 4. Switching and Updating Profiles

When tailoring an application, `resume-manager` inspects the job description and suggests or automatically selects the matching profile track. If a new skill or win is recorded, the skill asks which tracks should reflect the addition, ensuring the entire profile suite stays harmonized.
