# ⚡ Reactive Skills Registry

> Official community catalog of verified, production-grade **Reactive Skills** powered by the [Reactive Skills Architecture](https://github.com/Reactive-Skills/reactive-skills).

---

## 📥 Installation

Install any skill directly into your agent environment using `skills.sh` (`npx skills`):

```bash
# Install skill-manager
npx skills add Reactive-Skills/skills --skill skill-manager

# Or install all official skills
npx skills add Reactive-Skills/skills
```

---

## 📋 Available Skills

| Skill | Description | Status |
| :--- | :--- | :--- |
| [`skill-manager`](skill-manager/) | Full CRUD lifecycle management for reactive skills: create, update, delete, and migrate skills | Production |

---

## 🛠️ Execution & Requirements

Reactive skills execute immediately via **`npx`** (zero install required) or via the globally installed CLI:

```bash
# Zero install — works out of the box for any agent:
npx -y @reactive-skills/axi state <skill>
npx -y @reactive-skills/axi emit <skill> <signal>

# Optional: Install globally for instant local commands (reactive-skills-axi / axi):
npm install -g @reactive-skills/axi
```

---

## 🤝 Contributing Skills

We welcome community-contributed reactive skills! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on statechart modeling, deterministic guards, and test verification.

---

## 📜 License

Skills in this repository are licensed under the **MIT License**.
