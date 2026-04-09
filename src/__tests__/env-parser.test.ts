import { describe, it, expect } from 'vitest';
import { parseEnvFile } from '../lib/env-parser';

describe('env parser utils', () => {
  it('parses basic key value pairs', () => {
    const raw = `API_KEY=12345
SECRET=abc`;
    const result = parseEnvFile(raw);
    expect(result).toEqual({ API_KEY: '12345', SECRET: 'abc' });
  });

  it('ignores comments and empty lines', () => {
    const raw = `
# This is a comment
API_KEY=123

# Another comment
SECRET=456
    `;
    const result = parseEnvFile(raw);
    expect(result).toEqual({ API_KEY: '123', SECRET: '456' });
  });

  it('strips export prefix', () => {
    const raw = `export VAR=hi\nexport FOO=bar`;
    const result = parseEnvFile(raw);
    expect(result).toEqual({ VAR: 'hi', FOO: 'bar' });
  });

  it('handles quotes around values', () => {
    const raw = `VAR="hi there"\nFOO='bar'`;
    const result = parseEnvFile(raw);
    expect(result).toEqual({ VAR: 'hi there', FOO: 'bar' });
  });
  
  it('handles inline comments', () => {
    const raw = `VAR=123 # some comment`;
    const result = parseEnvFile(raw);
    expect(result).toEqual({ VAR: '123' });
  });
});
