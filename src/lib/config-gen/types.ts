/**
 * Types for multi-agent MCP configuration generation.
 *
 * Each AI agent (Gemini CLI, Qwen Code, Claude Code,
 * Goose, OpenCode) uses a different config file format.
 * These types unify the generation logic.
 */

/** Supported target agents for config generation. */
export type TargetAgent =
  | 'gemini'
  | 'qwen'
  | 'claude-code'
  | 'goose'
  | 'opencode'
  | 'crush';

/** Transport mechanism for an MCP server. */
export type McpTransport = 'stdio' | 'sse' | 'http';

/**
 * Canonical MCP server definition used internally.
 * Each agent generator maps this to its own format.
 */
export interface CanonicalMcpServer {
  /** Unique identifier for the server. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Short description of what this server does. */
  description: string;
  /** Transport type. */
  transport: McpTransport;

  // --- Stdio fields ---
  /** Command to execute (e.g. 'npx', 'uvx'). */
  command?: string;
  /** Arguments to pass to the command. */
  args?: string[];
  /** Environment variables for the subprocess. */
  env?: Record<string, string>;

  // --- HTTP/SSE fields ---
  /** Remote URL for HTTP/SSE transport. */
  url?: string;
  /** HTTP headers (e.g. auth tokens). */
  headers?: Record<string, string>;

  /** Whether this server is enabled by default. */
  enabledByDefault: boolean;
}

/**
 * Result of generating a config for an agent.
 * Contains the file path and serialized content.
 */
export interface GeneratedConfig {
  /** Target agent identifier. */
  agent: TargetAgent;
  /**
   * Relative file path where the agent expects
   * its config (e.g. '.gemini/settings.json').
   */
  filePath: string;
  /**
   * Serialized file content (JSON string, YAML
   * string, or TOML string depending on agent).
   */
  content: string;
  /** Format of the generated content. */
  format: 'json' | 'yaml' | 'toml';
}

/**
 * Options for config generation.
 */
export interface ConfigGenOptions {
  /** Which MCP servers to enable (by id). */
  enabledServerIds: string[];
  /**
   * Map of secret name -> value. Used to inject
   * real API keys. For GitHub Actions, use
   * '${{ secrets.NAME }}' placeholders.
   */
  secrets: Record<string, string>;
  /**
   * Whether we're generating for GitHub Actions
   * runners (affects browser paths, etc.).
   */
  isGitHubActions: boolean;
}
