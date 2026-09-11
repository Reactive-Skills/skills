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

## 🛠️ Requirements

Reactive skills require the **`reactive-skills-axi`** CLI in your agent's environment:

```bash
npm install -g @reactive-skills/axi
```

---

## 🤝 Contributing Skills

We welcome community-contributed reactive skills! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on statechart modeling, deterministic guards, and test verification.

---

## 📜 License

Skills in this repository are licensed under the **MIT License**.
