export function parseEnvFile(envText: string): Record<string, string> {
  const env: Record<string, string> = {};
  
  const lines = envText.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    
    // Support "export KEY=value"
    if (line.startsWith('export ')) {
      line = line.replace(/^export\s+/, '');
    }
    
    const splitIndex = line.indexOf('=');
    if (splitIndex === -1) continue;
    
    const key = line.substring(0, splitIndex).trim();
    let value = line.substring(splitIndex + 1).trim();
    
    // Handle inline comments
    // Simplistic handling: if there's a space followed by # 
    const commentIndex = value.indexOf(' #');
    if (commentIndex !== -1) {
      value = value.substring(0, commentIndex).trim();
    }
    
    // Handle quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    if (key) {
      env[key] = value;
    }
  }
  
  return env;
}
