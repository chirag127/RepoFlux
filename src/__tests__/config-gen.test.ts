/**
 * Tests for multi-agent MCP config generators.
 *
 * Verifies that each agent's config generator
 * produces the correct format with proper field
 * names, secret resolution, and structure.
 */
import { describe, it, expect } from 'vitest';
import {
  generateGeminiConfig,
  generateQwenConfig,
  generateClaudeCodeConfig,
  generateGooseConfig,
  generateOpenCodeConfig,
  generateCrushConfig,
  generateAllConfigs,
  generateConfigForAgent,
} from '../lib/config-gen';
import type {
  ConfigGenOptions,
} from '../lib/config-gen';

const BASE_OPTIONS: ConfigGenOptions = {
  enabledServerIds: [
    'context7',
    'ref',
    'docfork',
    'exa',
    'linkup',
    'kindly-web-search',
    'sequential-thinking',
  ],
  secrets: {
    CONTEXT7_API_KEY: 'test-ctx7-key',
    REF_API_KEY: 'test-ref-key',
    LINKUP_API_KEY: 'test-linkup-key',
    SERPER_API_KEY: 'test-serper-key',
    TAVILY_API_KEY: 'test-tavily-key',
  },
  isGitHubActions: true,
};

// ─── Gemini CLI ───

describe('Gemini CLI Config Generator', () => {
  it('produces valid JSON', () => {
    const result = generateGeminiConfig(
      BASE_OPTIONS,
    );
    expect(result.format).toBe('json');
    expect(result.agent).toBe('gemini');
    expect(result.filePath).toBe(
      '.gemini/settings.json',
    );
    const parsed = JSON.parse(result.content);
    expect(parsed.mcpServers).toBeDefined();
  });

  it('uses httpUrl for remote servers', () => {
    const result = generateGeminiConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const ctx7 = parsed.mcpServers['context7'];
    expect(ctx7.httpUrl).toBe(
      'https://mcp.context7.com/mcp',
    );
    expect(ctx7.command).toBeUndefined();
  });

  it('resolves secrets in headers', () => {
    const result = generateGeminiConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const ctx7 = parsed.mcpServers['context7'];
    expect(ctx7.headers.CONTEXT7_API_KEY).toBe(
      'test-ctx7-key',
    );
  });

  it('embeds linkup API key in URL', () => {
    const result = generateGeminiConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const linkup = parsed.mcpServers['linkup'];
    expect(linkup.httpUrl).toContain(
      'apiKey=test-linkup-key',
    );
  });

  it(
    'uses command/args for stdio servers',
    () => {
      const result = generateGeminiConfig(
        BASE_OPTIONS,
      );
      const parsed = JSON.parse(result.content);
      const docfork =
        parsed.mcpServers['docfork'];
      expect(docfork.command).toBe('npx');
      expect(docfork.args).toEqual([
        '-y',
        'docfork',
      ]);
      expect(docfork.httpUrl).toBeUndefined();
    },
  );

  it('resolves env vars for stdio servers', () => {
    const result = generateGeminiConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const kindly =
      parsed.mcpServers['kindly-web-search'];
    expect(kindly.env.SERPER_API_KEY).toBe(
      'test-serper-key',
    );
    expect(kindly.env.TAVILY_API_KEY).toBe(
      'test-tavily-key',
    );
  });
});

// ─── Qwen Code ───

describe('Qwen Code Config Generator', () => {
  it('produces full settings.json structure', () => {
    const result = generateQwenConfig(
      BASE_OPTIONS,
    );
    expect(result.format).toBe('json');
    expect(result.agent).toBe('qwen');
    expect(result.filePath).toBe(
      '.qwen/settings.json',
    );
    const parsed = JSON.parse(result.content);

    // Verify full structure
    expect(parsed.security).toBeDefined();
    expect(
      parsed.security.auth.selectedType,
    ).toBe('qwen-oauth');
    expect(parsed.$version).toBe(3);
    expect(parsed.ide.enabled).toBe(true);
    expect(parsed.model.name).toBe(
      'coder-model',
    );
    expect(parsed.tools.approvalMode).toBe(
      'yolo',
    );
    expect(parsed.general.language).toBe('en');
    expect(parsed.context).toBeDefined();
    expect(parsed.mcpServers).toBeDefined();
  });

  it('uses httpUrl for remote servers', () => {
    const result = generateQwenConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const ref = parsed.mcpServers['ref'];
    expect(ref.httpUrl).toBe(
      'https://api.ref.tools/mcp',
    );
    expect(ref.headers['x-ref-api-key']).toBe(
      'test-ref-key',
    );
  });

  it('uses command/args for stdio servers', () => {
    const result = generateQwenConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const st = parsed.mcpServers[
      'sequential-thinking'
    ];
    expect(st.command).toBe('npx');
    expect(st.args).toContain('-y');
  });

  it('includes kindly with resolved env', () => {
    const result = generateQwenConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const kindly =
      parsed.mcpServers['kindly-web-search'];
    expect(kindly.command).toBe('uvx');
    expect(kindly.env.SERPER_API_KEY).toBe(
      'test-serper-key',
    );
    expect(
      kindly.env
        .KINDLY_BROWSER_EXECUTABLE_PATH,
    ).toBe('/usr/bin/google-chrome-stable');
  });
});

// ─── Claude Code ───

describe('Claude Code Config Generator', () => {
  it('produces .mcp.json with type field', () => {
    const result = generateClaudeCodeConfig(
      BASE_OPTIONS,
    );
    expect(result.filePath).toBe('.mcp.json');
    const parsed = JSON.parse(result.content);
    const ctx7 = parsed.mcpServers['context7'];
    expect(ctx7.type).toBe('http');
    expect(ctx7.url).toBe(
      'https://mcp.context7.com/mcp',
    );
  });

  it('stdio servers have type: stdio', () => {
    const result = generateClaudeCodeConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const docfork =
      parsed.mcpServers['docfork'];
    expect(docfork.type).toBe('stdio');
    expect(docfork.command).toBe('npx');
  });
});

// ─── Goose ───

describe('Goose Config Generator', () => {
  it('produces YAML with extensions root', () => {
    const result = generateGooseConfig(
      BASE_OPTIONS,
    );
    expect(result.format).toBe('yaml');
    expect(result.content).toContain(
      'extensions:',
    );
  });

  it('uses type: sse for remote servers', () => {
    const result = generateGooseConfig(
      BASE_OPTIONS,
    );
    expect(result.content).toContain(
      'type: sse',
    );
  });

  it('uses type: stdio for local servers', () => {
    const result = generateGooseConfig(
      BASE_OPTIONS,
    );
    expect(result.content).toContain(
      'type: stdio',
    );
  });

  it('includes enabled and timeout', () => {
    const result = generateGooseConfig(
      BASE_OPTIONS,
    );
    expect(result.content).toContain(
      'enabled: true',
    );
    expect(result.content).toContain(
      'timeout: 300',
    );
  });
});

// ─── OpenCode ───

describe('OpenCode Config Generator', () => {
  it('produces .opencode.json', () => {
    const result = generateOpenCodeConfig(
      BASE_OPTIONS,
    );
    expect(result.filePath).toBe(
      '.opencode.json',
    );
    const parsed = JSON.parse(result.content);
    expect(parsed.mcpServers).toBeDefined();
  });

  it('uses type: sse for remote servers', () => {
    const result = generateOpenCodeConfig(
      BASE_OPTIONS,
    );
    const parsed = JSON.parse(result.content);
    const exa = parsed.mcpServers['exa'];
    expect(exa.type).toBe('sse');
    expect(exa.url).toBeDefined();
  });
});

// ─── Crush ───

describe('Crush Config Generator', () => {
  it('produces TOML format', () => {
    const result = generateCrushConfig(
      BASE_OPTIONS,
    );
    expect(result.format).toBe('toml');
    expect(result.content).toContain(
      '[mcp.servers.',
    );
  });

  it('uses url for remote servers', () => {
    const result = generateCrushConfig(
      BASE_OPTIONS,
    );
    expect(result.content).toContain(
      'url = "https://mcp.context7.com/mcp"',
    );
  });

  it('uses command for stdio servers', () => {
    const result = generateCrushConfig(
      BASE_OPTIONS,
    );
    expect(result.content).toContain(
      'command = "npx"',
    );
  });
});

// ─── Unified API ───

describe('Unified Config Generator', () => {
  it('generateAllConfigs returns 6 configs', () => {
    const results = generateAllConfigs(
      BASE_OPTIONS,
    );
    expect(results).toHaveLength(6);
  });

  it('generateConfigForAgent works', () => {
    const result = generateConfigForAgent(
      'gemini',
      BASE_OPTIONS,
    );
    expect(result.agent).toBe('gemini');
  });

  it('throws for unknown agent', () => {
    expect(() =>
      generateConfigForAgent(
        'unknown' as never,
        BASE_OPTIONS,
      ),
    ).toThrow('Unknown agent');
  });
});
