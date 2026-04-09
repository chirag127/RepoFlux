# RepoFlux — Implementation Plan

> A 100% static, zero-backend web control plane for GitHub repository orchestration with free AI coding CLI agents.
> Domain: `repoflux.dev` | Repo: `chirag127/RepoFlux`

---

## User Review Required

> [!IMPORTANT]
> **9 AI CLI Agents**: Beyond the 7 originally listed, I'm adding **Claude Code** (free via OpenRouter) and **Codex CLI** (free via OpenRouter) since both support headless mode and can use free model providers. Total: 9 agents.

> [!IMPORTANT]
> **Tailwind CSS v4** (not v3): Astro 6 uses `@tailwindcss/vite` plugin with CSS-first `@theme` config. The old `@astrojs/tailwind` + `tailwind.config.js` approach is deprecated.

> [!WARNING]
> **API Keys from your MCP config**: Your Context7, Ref, Serper, Tavily keys will **NOT** be committed to source code. They'll be documented in `.env.example` as placeholders only. You'll deploy them as GitHub Secrets via the Settings page.

> [!IMPORTANT]
> **No "subagent" concept**: MCP servers are referred to as "tools" throughout the codebase — configurable tool integrations that extend AI agent capabilities. No subagent files or terminology.

---

## Proposed Changes

### Phase 1: Project Scaffold & Foundation (~15 files)

Initialize Astro 6 with React 19, Tailwind CSS v4, shadcn/ui, TypeScript strict mode, and Vitest.

#### [NEW] astro.config.mjs
- Astro 6 config: `output: 'static'`, `site: 'https://repoflux.dev'`
- Integrations: `@astrojs/react`
- Vite config: `@tailwindcss/vite` plugin, optimizeDeps for tweetnacl

#### [NEW] tsconfig.json
- `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- Path aliases: `@/*` → `src/*`

#### [NEW] vitest.config.ts
- jsdom env, globals: true, coverage v8, 80% threshold

#### [NEW] components.json
- shadcn/ui config for Astro + React

#### [NEW] package.json
- All dependencies (astro, react 19, tailwindcss v4, tweetnacl stack, shadcn/ui primitives, sonner, lucide-react, date-fns, nanoid, clsx, tailwind-merge, class-variance-authority)
- Dev deps: vitest, testing-library, msw, jsdom, typescript

#### [MODIFY] .gitignore
- Add: `dist/`, `.astro/`, `.env`, `.env.local`, `.vercel/`, `.wrangler/`

#### [NEW] .env.example
- All env var placeholders (GEMINI_API_KEY, GROQ_API_KEY, etc.) — no values

#### [NEW] src/styles/globals.css
- Tailwind v4 `@import "tailwindcss"` + `@theme` directive
- Design system: GitHub dark colors, terminal theme, ANSI classes
- JetBrains Mono font import, scrollbar styling, dark mode

---

### Phase 2: Type System (~7 files)

All TypeScript interfaces in `src/types/`.

#### [NEW] src/types/repository.ts
- `AgentType` union (9 agents: gemini, aider, opencode, crush, qwen, goose, claude-code, codex, aider-ollama)
- `ManagedRepository` interface

#### [NEW] src/types/run.ts
- `RunStatus` union, `AgentRun` interface

#### [NEW] src/types/agent.ts
- `AgentExecutor`, `AgentConfig` interfaces

#### [NEW] src/types/prompt-template.ts
- `PromptTemplate` interface

#### [NEW] src/types/config.ts
- `GlobalConfig` interface

#### [NEW] src/types/github.ts
- GitHub API response types (GitHubUser, GitHubRepo, Workflow, WorkflowRun, WorkflowJob, ContentFile, RepoPublicKey)

#### [NEW] src/types/mcp.ts
- `McpServerDefinition`, `McpSettings` interfaces

---

### Phase 3: Core Library Layer (~18 files)

All in `src/lib/`. The engine powering the entire application.

#### [NEW] src/lib/github-client.ts
- Authenticated fetch wrapper: Auth header, rate limit tracking
- 401 handler, 403 rate limit backoff, 5xx retry (max 2)
- `X-GitHub-Api-Version` header

#### [NEW] src/lib/github-api/index.ts — Re-exports
#### [NEW] src/lib/github-api/user.ts — GET /user
#### [NEW] src/lib/github-api/repos.ts — Search, get, create repos
#### [NEW] src/lib/github-api/contents.ts — Read/write/delete files (with SHA)
#### [NEW] src/lib/github-api/workflows.ts — List, dispatch, list runs, cancel
#### [NEW] src/lib/github-api/jobs.ts — Get jobs, get logs (follow 302)
#### [NEW] src/lib/github-api/secrets.ts — Get public key, create/update encrypted secrets

#### [NEW] src/lib/state-manager.ts
- `readFile<T>`, `writeFile<T>`, `deleteFile`, `listDirectory`, `initStateRepo`
- Sharded JSON in state repo

#### [NEW] src/lib/concurrency.ts
- `withOptimisticLock<T>` — 409 retry with SHA re-fetch

#### [NEW] src/lib/workflow-installer.ts
- Check/install `repoflux-agent.yml` in target repos

#### [NEW] src/lib/secret-encryptor.ts
- tweetnacl + tweetnacl-sealedbox-js sealed box encryption
- Compatible with GitHub's libsodium format

#### [NEW] src/lib/env-parser.ts
- Parse `.env` text → `Record<string, string>`

#### [NEW] src/lib/log-parser.ts
- `parseAnsiToHtml()`, `parseGeminiStreamJson()`, `formatDuration()`, `extractLogLines()`

#### [NEW] src/lib/nanoid.ts
- Tiny ID generator using `crypto.getRandomValues`

---

### Phase 4: Agent Registry & MCP Config (~13 files)

#### [NEW] src/lib/agents/types.ts — AgentExecutor interface
#### [NEW] src/lib/agents/registry.ts — `AGENT_REGISTRY` map of all 9 agents

Individual agent implementations (install command, execute command, MCP config path, required secrets):
#### [NEW] src/lib/agents/gemini.ts
#### [NEW] src/lib/agents/aider.ts
#### [NEW] src/lib/agents/opencode.ts
#### [NEW] src/lib/agents/crush.ts
#### [NEW] src/lib/agents/qwen.ts
#### [NEW] src/lib/agents/goose.ts
#### [NEW] src/lib/agents/claude-code.ts — Uses OPENROUTER_API_KEY with free models
#### [NEW] src/lib/agents/codex.ts — Uses OPENROUTER_API_KEY with free models
#### [NEW] src/lib/agents/aider-ollama.ts — Local, 100% free

#### [NEW] src/lib/mcp/servers.ts — All MCP server definitions
#### [NEW] src/lib/mcp/config-generator.ts — Generate per-agent MCP config files

---

### Phase 5: React Hooks (~7 files)

#### [NEW] src/hooks/useGitHubAuth.ts — PAT CRUD + validation + user fetch
#### [NEW] src/hooks/useHashRouter.ts — Lightweight hash-based SPA router
#### [NEW] src/hooks/useLogPoller.ts — GitHub Jobs API polling for live logs
#### [NEW] src/hooks/useRateLimit.ts — Track X-RateLimit-Remaining
#### [NEW] src/hooks/useStateRepo.ts — Wraps state-manager operations
#### [NEW] src/hooks/useOnline.ts — navigator.onLine + offline banner
#### [NEW] src/hooks/useSecretDeployer.ts — Encrypt + deploy secrets

---

### Phase 6: UI Components — shadcn/ui (~25 files)

Install shadcn/ui components via CLI. All in `src/components/ui/`:
- button, card, input, textarea, badge, dialog, alert-dialog, toast, toaster, tooltip, skeleton, separator, scroll-area, alert, progress, tabs, dropdown-menu, avatar, select, switch, slider, label, popover, command, sonner

---

### Phase 7: Static Pages (~8 files)

#### [NEW] src/layouts/BaseLayout.astro — HTML shell, dark mode, SEO meta, OG tags, fonts
#### [NEW] src/layouts/LegalLayout.astro — Legal pages wrapper

#### [NEW] src/pages/index.astro — Landing page (zero JS)
#### [NEW] src/pages/dashboard.astro — Dashboard shell + React island
#### [NEW] src/pages/privacy.astro — Privacy policy
#### [NEW] src/pages/terms.astro — Terms of service
#### [NEW] src/pages/404.astro — Custom 404

#### [NEW] src/components/landing/ (8 files)
- Navbar.astro, Hero.astro, HowItWorks.astro, FeaturesGrid.astro
- AgentShowcase.astro, TechStack.astro, FAQ.astro, Footer.astro
- All pure Astro/HTML — zero JavaScript shipped

---

### Phase 8: Dashboard React Components (~35 files)

#### Auth Components (3 files)
- [NEW] src/components/auth/TokenInput.tsx
- [NEW] src/components/auth/AuthGuard.tsx
- [NEW] src/components/auth/UserBadge.tsx

#### Dashboard Shell (7 files)
- [NEW] src/components/dashboard/DashboardApp.tsx — Root island + hash router
- [NEW] src/components/dashboard/DashboardLayout.tsx — Sidebar + topbar + content
- [NEW] src/components/dashboard/Sidebar.tsx
- [NEW] src/components/dashboard/Topbar.tsx
- [NEW] src/components/dashboard/RateLimitBadge.tsx
- [NEW] src/components/dashboard/OfflineBanner.tsx
- [NEW] src/components/dashboard/EmptyState.tsx

#### Repository Views (7 files)
- [NEW] src/components/dashboard/repos/RepoList.tsx
- [NEW] src/components/dashboard/repos/RepoCard.tsx
- [NEW] src/components/dashboard/repos/AddRepo.tsx — 4-step wizard
- [NEW] src/components/dashboard/repos/CreateRepo.tsx
- [NEW] src/components/dashboard/repos/RepoDetail.tsx
- [NEW] src/components/dashboard/repos/WorkflowInstaller.tsx
- [NEW] src/components/dashboard/repos/SecretDeployer.tsx

#### Run Views (5 files)
- [NEW] src/components/dashboard/runs/RunHistory.tsx
- [NEW] src/components/dashboard/runs/RunRow.tsx
- [NEW] src/components/dashboard/runs/RunDetail.tsx
- [NEW] src/components/dashboard/runs/NewRun.tsx
- [NEW] src/components/dashboard/runs/RunStatusBadge.tsx

#### Log Viewer (3 files)
- [NEW] src/components/dashboard/logs/LogViewer.tsx — Terminal-style ANSI renderer
- [NEW] src/components/dashboard/logs/LogLine.tsx
- [NEW] src/components/dashboard/logs/LogControls.tsx

#### Prompt Templates (4 files)
- [NEW] src/components/dashboard/templates/PromptTemplates.tsx
- [NEW] src/components/dashboard/templates/TemplateCard.tsx
- [NEW] src/components/dashboard/templates/TemplateEditor.tsx
- [NEW] src/components/dashboard/templates/TemplateVariables.tsx

#### Settings (8 files)
- [NEW] src/components/dashboard/settings/Settings.tsx — Root with tabs
- [NEW] src/components/dashboard/settings/AuthSettings.tsx
- [NEW] src/components/dashboard/settings/StateRepoSettings.tsx
- [NEW] src/components/dashboard/settings/AgentSettings.tsx
- [NEW] src/components/dashboard/settings/SecretsManager.tsx
- [NEW] src/components/dashboard/settings/EnvFileParser.tsx
- [NEW] src/components/dashboard/settings/RateLimitPanel.tsx
- [NEW] src/components/dashboard/settings/PreferencesPanel.tsx

---

### Phase 9: GitHub Actions Workflow

#### [NEW] .github/workflows/repoflux-agent.yml
- `workflow_dispatch` with inputs: run_id, prompt, agent_type, state_repo, branch, model overrides
- Steps for all 9 agents (install + execute)
- MCP config writing per agent type
- Commit + push AI changes
- Upload log to state repo
- Update run status (in_progress → completed/failed)

---

### Phase 10: Public Assets & SEO

#### [NEW] public/favicon.svg — RepoFlux orbit/flux SVG logo
#### [NEW] public/robots.txt — Allow all crawlers
#### [NEW] public/sitemap.xml — Static sitemap
#### [NEW] public/ads.txt — Blank placeholder
#### [NEW] public/_redirects — `/dashboard/* → /dashboard 200`

---

### Phase 11: Tests (~8 files)

#### [NEW] src/__tests__/setup.ts — MSW + localStorage mock
#### [NEW] src/__tests__/auth.test.ts
#### [NEW] src/__tests__/concurrency.test.ts
#### [NEW] src/__tests__/github-api.test.ts
#### [NEW] src/__tests__/state-manager.test.ts
#### [NEW] src/__tests__/log-parser.test.ts
#### [NEW] src/__tests__/env-parser.test.ts
#### [NEW] src/__tests__/secret-encryptor.test.ts
#### [NEW] src/__tests__/workflow-installer.test.ts

---

### Phase 12: CI/CD & Deployment

#### [NEW] .github/workflows/ci.yml
- Lint → Type-check → Unit tests → Build
- `continue-on-error: true` per step

#### Manual deployment via `wrangler pages deploy`

---

## All 9 Supported AI CLI Agents

| # | Agent | Package/Install | Headless Command | Free Via | MCP Support |
|---|-------|----------------|------------------|----------|-------------|
| 1 | **Gemini CLI** | `npm i -g @google/gemini-cli` | `gemini -p "PROMPT"` | Google AI Studio (1000 req/day) | ✅ `.gemini/settings.json` |
| 2 | **Aider** | `pip install aider-chat` | `aider --message "PROMPT" --yes --no-git` | Gemini/Groq/OpenRouter keys | ❌ (native repomap) |
| 3 | **OpenCode** | `curl -fsSL https://opencode.ai/install \| bash` | `opencode -p "PROMPT" -f json -q` | Gemini/Groq/OpenRouter | ✅ `.opencode/config.json` |
| 4 | **Crush** | Binary from GitHub releases | `crush --prompt "PROMPT" --yes` | OpenRouter/Gemini/Groq | ✅ config.toml |
| 5 | **Qwen Code** | `npm i -g @qwen-code/qwen-code` | `qwen -p "PROMPT" --yolo` | DashScope free tier | ✅ `.qwen/settings.json` |
| 6 | **Goose** | `curl install script` | `goose run --text "PROMPT"` | Gemini/Groq/OpenRouter | ✅ config.yaml |
| 7 | **Claude Code** | `npm i -g @anthropic-ai/claude-code` | `claude -p "PROMPT"` | OpenRouter free models | ✅ `.claude/settings.json` |
| 8 | **Codex CLI** | `npm i -g @openai/codex` | `codex exec --full-auto "PROMPT"` | OpenRouter free models | ❌ |
| 9 | **Aider + Ollama** | `pip install aider-chat` + Ollama | `aider --model ollama/codellama:13b --message "PROMPT" --yes` | 100% free, local | ❌ |

---

## MCP Servers Integrated (User-Configurable in Settings)

| Server | Type | Purpose | API Key Required |
|--------|------|---------|-----------------|
| sequential-thinking | npx stdio | Step-by-step reasoning | None |
| context7 | HTTP serverUrl | Library documentation lookup | CONTEXT7_API_KEY |
| ref | HTTP serverUrl | Reference docs & knowledge | REF_API_KEY |
| filesystem | npx stdio | File read/write/search | None |
| github | npx stdio | GitHub API operations | GITHUB_TOKEN (auto) |
| memory | npx stdio | Persistent key-value memory | None |
| fetch | npx stdio | HTTP fetch capability | None |

Users configure which MCP servers to enable and provide API keys via the Settings → AI Agents tab. Keys are deployed as GitHub Secrets and injected at runtime.

---

## Free Model Providers

| Provider | Env Variable | Free Tier | Signup URL |
|----------|-------------|-----------|------------|
| Google AI Studio | GEMINI_API_KEY | Gemini 2.5 Pro, 1000 req/day | aistudio.google.com |
| Groq | GROQ_API_KEY | Llama 3.3 70B, Gemma2 | console.groq.com |
| OpenRouter | OPENROUTER_API_KEY | Free models (Gemini, Llama, DeepSeek) | openrouter.ai |
| Together AI | TOGETHER_API_KEY | Free credits on signup | api.together.xyz |
| Hugging Face | HF_TOKEN | Free Inference API | huggingface.co |
| DashScope | QWEN_API_KEY | Qwen2.5-Coder free tier | dashscope.aliyuncs.com |
| Ollama (local) | None | 100% free, local models | ollama.com |

---

## Design System

**Color palette** (GitHub dark theme inspired):
- Background: `#0d1117`, Surface: `#161b22`, Elevated: `#1c2128`
- Text: `#c9d1d9` primary, `#8b949e` secondary, `#6e7681` muted
- Accents: Blue `#58a6ff`, Green `#3fb950`, Red `#ff7b72`, Orange `#f0883e`, Purple `#d2a8ff`, Cyan `#39c5cf`

**Agent brand colors** for badges:
- Gemini `#1B73E8`, Aider `#F4B942`, OpenCode `#7C3AED`, Crush `#EC4899`, Qwen `#FF6B35`, Goose `#059669`, Claude Code `#D97706`, Codex `#10B981`, Aider+Ollama `#6B7280`

**Typography**: System UI for app, JetBrains Mono for logs/code

---

## State Repository Structure

```
{username}-repoflux-state/          (auto-created)
├── config.json                      GlobalConfig
├── repositories/{id}.json           ManagedRepository (per repo)
├── runs/{runId}.json                AgentRun (per run)
├── prompts/{promptId}.json          PromptTemplate (per template)
└── logs/{runId}.log                 Plain text logs
```

---

## Open Questions

> [!IMPORTANT]
> 1. **Domain `repoflux.dev`**: Do you already own this domain? If not, should I use a Cloudflare Pages subdomain (e.g., `repoflux.pages.dev`) for initial deployment?

> [!IMPORTANT]
> 2. **Claude Code & Codex CLI**: Both require API keys from paid providers (Anthropic/OpenAI) but CAN use OpenRouter with free models. Should I include them both? They add flexibility but need `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` configured.

> [!IMPORTANT]
> 3. **Estimated scope**: This is ~120+ files and a massive undertaking. Should I build the full scope or start with a minimum viable version (landing page + dashboard with Gemini CLI only) and iterate?

---

## Verification Plan

### Automated Tests
- `npm run test` — Vitest suite covering auth, concurrency, API client, state manager, log parser, env parser, secret encryption, workflow installer
- `npm run build` — Astro static build must succeed with zero errors
- `npm run lint` — TypeScript strict mode, no `any` types

### Manual Verification
- Browser test: Navigate landing page → dashboard → token input → repos → new run → log viewer
- Verify state repo auto-creation flow
- Verify workflow installation in a test repo
- Verify secret encryption + deployment
- Deploy to Cloudflare Pages via `wrangler pages deploy dist/`
