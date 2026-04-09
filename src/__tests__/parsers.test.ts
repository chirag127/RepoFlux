import { expect, test, describe } from 'vitest';
import { parseEnvFile } from '../lib/env-parser';
import { formatDuration } from '../lib/log-parser';

describe('Environment Parser', () => {
  test('parses basic assignments', () => {
    const raw = `
      KEY1=value1
      KEY2=value2
    `;
    const res = parseEnvFile(raw);
    expect(res).toEqual({ KEY1: 'value1', KEY2: 'value2' });
  });

  test('ignores comments and empty lines', () => {
    const raw = `
      # This is a comment
      
      KEY1=value1 # Inline comment
      export KEY2="value2"
    `;
    const res = parseEnvFile(raw);
    expect(res).toEqual({ KEY1: 'value1', KEY2: 'value2' });
  });
});

describe('Log Parser Helpers', () => {
  test('formatDuration', () => {
    expect(formatDuration(125000)).toBe('2m 5s');
    expect(formatDuration(60000)).toBe('1m 0s');
    expect(formatDuration(1000)).toBe('0m 1s');
  });
});
