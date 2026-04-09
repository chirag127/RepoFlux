import { useState, useCallback, useEffect } from 'react';
import { readStateFile, writeStateFile, initStateRepo } from '../lib/state-manager';
import { withOptimisticLock } from '../lib/concurrency';
import type { GlobalConfig } from '../types/config';

const DEFAULT_CONFIG: GlobalConfig = {
  version: 1,
  updatedAt: Date.now(),
  defaultAgentType: 'gemini',
  mcpConfig: {
    enabledServers: ['sequential-thinking'],
    keys: {}
  },
  uiPreferences: {
    theme: 'dark',
    logFontSize: 'base',
    logWordWrap: true,
    pollingIntervalMs: 3000
  }
};

export function useAppStorage() {
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Initialize repo and load config
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      await initStateRepo();
      const { content } = await readStateFile<GlobalConfig>('config.json');
      if (content) {
        // Merge defaults in case of new fields
        setConfig({ ...DEFAULT_CONFIG, ...content, uiPreferences: { ...DEFAULT_CONFIG.uiPreferences, ...content.uiPreferences }, mcpConfig: { ...DEFAULT_CONFIG.mcpConfig, ...content.mcpConfig }});
      }
    } catch (err) {
      console.error('Failed to load RepoFlux config:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateConfig = async (updater: (prev: GlobalConfig) => GlobalConfig) => {
    try {
      // Optimistic locally
      const newConfigLocally = updater(config);
      newConfigLocally.updatedAt = Date.now();
      setConfig(newConfigLocally);

      // Write via optimistic lock
      await withOptimisticLock(
        () => readStateFile<GlobalConfig>('config.json'),
        (content, sha) => writeStateFile('config.json', content, sha, 'Update global config'),
        (content) => {
          const base = content || DEFAULT_CONFIG;
          const merged = updater(base);
          merged.updatedAt = Date.now();
          return merged;
        }
      );
    } catch (err) {
      console.error('Failed to save config:', err);
      // Rollback logic could go here, but omitted for simplicity
    }
  };

  return { config, updateConfig, isLoading, isError, reload: loadConfig };
}
