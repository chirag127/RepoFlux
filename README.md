# RepoFlux

The autonomous control plane for GitHub repositories.

<p align="center">
  <b>100% Client-Side. Zero-Backend Architecture.</b><br>
  Manage repos, dispatch AI agents, stream logs directly from the browser.
</p>

## Overview

RepoFlux sits on top of your GitHub repositories as a static web console. By leveraging your GitHub Personal Access Token (`localStorage` + TweetNaCl encryption), it allows you to inject fully-autonomous AI coding agents directly into your CI/CD pipelines via dynamic GitHub Action dispatching.

No backend servers required. No databases. Your code and API keys never touch our servers.

## Features

- **BYOT Security:** Everything is executed locally using your GitHub PAT.
- **Agent Intelligence Registry:** 9 integrated CLI agents including Gemini CLI, Aider, OpenCode, Qwen Code, Goose, CLI, and offline Ollama.
- **Embedded MCP Subsystem:** Dynamic Model Context Protocol injection out-of-the-box for Context7 docs, ref APIs, and Sequential Thinking reasoner.
- **Live Telemetry:** Stream ANSI-formatted workflow logs in real-time.
- **State Segregation:** All configurations are saved to a dedicated, private `[your-username]-repoflux-state` repository using optimistic concurrency.

## 🔐 Authentication & Permissions

RepoFlux interacts with the GitHub API on your behalf. For full functionality, your **Personal Access Token (PAT)** requires specific permissions:

### Recommended Setup (Classic PAT)
The simplest way is to create a [Classic Token](https://github.com/settings/tokens) with the `repo` scope. This covers repository content, actions, and secrets.

### Secure Setup (Fine-Grained PAT)
If you prefer [Fine-Grained Tokens](https://github.com/settings/personal-access-tokens/new), grant **Read and Write** access to the following **Repository Permissions**:
- **Actions**: Triggering missions.
- **Secrets**: Injecting API keys for agents.
- **Contents**: Installing configurations.
- **Workflows**: Managing agent YAML files.
- **Metadata**: Base repository access (Read-only).

> [!WARNING]
> If you encounter a `Resource not accessible` error, it almost always means your token lacks the **Secrets: Write** or **Actions: Write** permission. Ensure these are enabled in your token settings.


## Architecture & Data Flow

1. **Auth:** User provides GitHub PAT (stored securely in browser memory/localStorage).
2. **Setup:** If missing, a `repoflux-state` repository is seamlessly initialized.
3. **Dispatch:** User provides an objective. RepoFlux encrypts API keys (Gemini, OpenRouter, etc.) via LibSodium sealed boxes and pushes them to the target repository's GitHub Secrets.
4. **Execution:** RepoFlux triggers a dynamically generated GitHub Action (`repoflux-agent.yml`) inside the target repository.
5. **Telemetry:** The React SPA polls the GitHub Actions API and parses ANSI terminal colors to a real-time UI log viewer.

## Running Locally

Because RepoFlux is 100% static, you just need Node.js and `pnpm`:

```bash
pnpm install
pnpm dev
# App listens on http://localhost:4321
```

## Supported Agents

- **Gemini CLI** (Google AI Foundation)
- **Aider** (Pair Programming CLI)
- **OpenCode** (Terminal Agent)
- **Crush** (Charmbracelet)
- **Qwen Code** (Alibaba OSS)
- **Goose** (Block/Square)
- **Claude Code** (Anthropic)
- **Codex CLI** (OpenAI legacy)
- **Aider + Ollama** (100% Free, Local Actions execution via CodeLlama)

---

**Built by [chirag127](https://github.com/chirag127)**
