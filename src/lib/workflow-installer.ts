import { getFile, writeFile } from './github';
import { generateAllConfigs } from './config-gen';
import { CANONICAL_SERVERS } from './config-gen/servers';

export const WORKFLOW_PATH = '.github/workflows/repoflux-agent.yml';

export function getWorkflowYamlTemplate() {
  const allIds = CANONICAL_SERVERS.map(s => s.id);
  const workflowSecrets: Record<string, string> = {
    CONTEXT7_API_KEY: '${{ secrets.CONTEXT7_API_KEY }}',
    REF_API_KEY: '${{ secrets.REF_API_KEY }}',
    LINKUP_API_KEY: '${{ secrets.LINKUP_API_KEY }}',
    EXA_API_KEY: '${{ secrets.EXA_API_KEY }}',
    SERPER_API_KEY: '${{ secrets.SERPER_API_KEY }}',
    TAVILY_API_KEY: '${{ secrets.TAVILY_API_KEY }}',
    GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
  };

  const configs = generateAllConfigs({
    enabledServerIds: allIds,
    secrets: workflowSecrets,
    isGitHubActions: true,
  });

  let configGenerationSteps = `      - name: Generate Global Context and MCP Configurations
        run: |
          mkdir -p .gemini .opencode .qwen .claude
          
          # --- Global Context (GEMINI.md) ---
          cat << 'GEMINIMD_EOF' > GEMINI.md
          # Project Instructions
          - **Environment:** You are running in an automated CI/CD GitHub Actions environment.
          - **Focus:** Always output functional and production-ready code.
          - **Constraints:** Do not use interactive shell commands. Assume \`--yolo\` approval mode.
          GEMINIMD_EOF
          
          # --- Exclusions (.geminiignore) ---
          cat << 'GEMINIIGNORE_EOF' > .geminiignore
          node_modules/
          dist/
          build/
          .git/
          .env
          GEMINIIGNORE_EOF
`;

  for (const config of configs) {
    const eofMarker = `${config.agent.toUpperCase().replace(/[^A-Z]/g, '')}_EOF`;
    configGenerationSteps += `\n          # --- ${config.agent} (${config.filePath}) ---\n`;
    configGenerationSteps += `          cat << '${eofMarker}' > ${config.filePath}\n`;
    configGenerationSteps += config.content;
    configGenerationSteps += `\n          ${eofMarker}\n`;

    // Special copy steps to align with agent runners
    if (config.agent === 'claude-code') {
      configGenerationSteps += `          cp .mcp.json .claude/settings.json\n`;
    }
    if (config.agent === 'opencode') {
      configGenerationSteps += `          cp .opencode.json .opencode/config.json\n`;
    }
  }

  return `
name: RepoFlux — AI Coding Agent

on:
  workflow_dispatch:
    inputs:
      run_id:
        description: 'RepoFlux Run ID'
        required: true
        type: string
      prompt:
        description: 'The task for the AI agent'
        required: true
        type: string
      agent_type:
        description: 'Which agent to use (gemini, aider, opencode, crush, qwen, goose, claude-code, codex, aider-ollama)'
        required: false
        default: 'gemini'
        type: string
      state_repo:
        description: 'The state repository name'
        required: true
        type: string
      branch:
        description: 'Branch to run on'
        required: false
        default: 'main'
        type: string
      openrouter_model:
        description: 'Model for OpenRouter agents'
        required: false
        default: 'meta-llama/llama-4-scout:free'

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  run-agent:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: \${{ inputs.branch }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

${configGenerationSteps}
          
      - name: Run Gemini CLI
        if: inputs.agent_type == 'gemini'
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: |
          npm install -g @google/gemini-cli@latest
          gemini -p "\${{ inputs.prompt }}" --approval-mode=yolo

      - name: Run Qwen Code
        if: inputs.agent_type == 'qwen'
        env:
          QWEN_API_KEY: \${{ secrets.QWEN_API_KEY }}
        run: |
          npm install -g qwen-code
          qwen -p "\${{ inputs.prompt }}" --yolo

      - name: Run OpenCode
        if: inputs.agent_type == 'opencode'
        env:
          OPENROUTER_API_KEY: \${{ secrets.OPENROUTER_API_KEY }}
        run: |
          curl -fsSL https://opencode.ai/install | bash
          opencode -p "\${{ inputs.prompt }}" -f json -q

      - name: Run Claude Code (via OpenRouter)
        if: inputs.agent_type == 'claude-code'
        env:
          ANTHROPIC_BASE_URL: https://openrouter.ai/api
          ANTHROPIC_API_KEY: \${{ secrets.OPENROUTER_API_KEY }}
          ANTHROPIC_MODEL: \${{ inputs.openrouter_model }}
        run: |
          npm install -g @anthropic-ai/claude-code
          claude -p "\${{ inputs.prompt }}" --allowedTools "Read,Write,Edit,Bash"

      - name: Run Aider
        if: inputs.agent_type == 'aider'
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GROQ_API_KEY: \${{ secrets.GROQ_API_KEY }}
        run: |
          pip install aider-chat --break-system-packages
          aider --model gemini/gemini-2.5-pro --message "\${{ inputs.prompt }}" --yes --no-git

      - name: Commit and Push Changes
        run: |
          git config --global user.name "repoflux-agent[bot]"
          git config --global user.email "repoflux-agent[bot]@users.noreply.github.com"
          git add -A
          if git diff --staged --quiet; then
            echo "No changes to commit."
          else
            git commit -m "Auto-generated by RepoFlux (\${{ inputs.agent_type }})"
            git push origin \${{ inputs.branch }}
          fi
`;
}

// Provided for backward compatibility if other modules depend on it directly
export const WORKFLOW_YAML_TEMPLATE = getWorkflowYamlTemplate();

export async function checkWorkflowStatus(owner: string, repo: string, branch = 'main') {
  try {
    const file = await getFile(owner, repo, WORKFLOW_PATH, branch);
    return { installed: !!file, sha: file?.sha };
  } catch {
    return { installed: false };
  }
}

export async function installAgentWorkflow(owner: string, repo: string, branch = 'main', existingSha?: string) {
  const msg = existingSha ? 'Update RepoFlux Agent Workflow' : 'Install RepoFlux Agent Workflow';
  console.log(`[RepoFlux] Installing workflow to ${owner}/${repo} on branch: ${branch}`);
  await writeFile(owner, repo, WORKFLOW_PATH, msg, getWorkflowYamlTemplate(), branch, existingSha);
}
