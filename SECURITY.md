# Security Policy

## Supported versions

Security fixes land in the latest version of each skill on `main` only.
Each skill is versioned independently in its `skill.yaml`, so reinstall or sync a skill to receive fixes.

## Reporting a vulnerability

Please do not report vulnerabilities in public issues, discussions, or pull requests.

Report them privately through GitHub: open the [Security tab](https://github.com/Reactive-Skills/skills/security) and choose **Report a vulnerability**.

Include what you can of the following:

- The affected skill and version.
- What an attacker can do, and what they need first, such as a crafted repository, a malicious file the agent reads, or a modified skill.
- Steps or a minimal example that reproduces the issue.
- Any fix or mitigation you suggest.

## What to expect

This project is maintained on a best-effort basis, with no guaranteed response times.
Reports are acknowledged as soon as practical, and you will be kept informed through the private advisory as the fix progresses.
Once a fix is released, the advisory is published with credit to the reporter unless you ask to stay anonymous.

## Scope

Skills are instructions and code that steer an agent with access to your tools, so these are in scope:

- Guard modules (`guards/*.cjs`, `guards/*.js`) or scripts that access the network, start processes, read credentials, or write outside the skill's working area without the skill saying so.
- State prompts, templates, or references that instruct an agent to exfiltrate data, skip approval gates, weaken safety checks, or act outside the skill's stated purpose.
- Hidden content such as zero-width or bidirectional Unicode, instruction-carrying HTML comments, or encoded payloads.
- Guards or gates that can be bypassed in a way that defeats a skill's documented approval or safety contract.
- Setup steps that download and execute unverified code.

Out of scope:

- Vulnerabilities in the Reactive Skills runtime or AXI CLI. Report those through [Reactive-Skills/reactive-skills](https://github.com/Reactive-Skills/reactive-skills/security).
- Skills installed from other repositories. Report those to their authors.

## Known issues

These weaknesses are public and tracked openly:

- Guard code in any skill currently runs with the full privileges of the runtime process. The runtime fix is tracked in [Reactive-Skills/reactive-skills#34](https://github.com/Reactive-Skills/reactive-skills/issues/34).
- Contributed skills are not yet scanned for malicious content in CI. This is tracked in [#20](https://github.com/Reactive-Skills/skills/issues/20).

Until these are fixed, install skills only from sources you trust, and review a skill's `guards/` directory and state prompts before installing or updating it.
