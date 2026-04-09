export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Convert common ANSI escape codes to HTML with tailwind utility classes defined in globals.css
export function parseAnsiToHtml(text: string): string {
  if (!text) return '';

  // Minimal sanitization before slicing up HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // GitHub Actions specific timestamps strip (2026-04...Z )
  html = html.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z\s/gm, '<span class="text-text-muted text-xs mr-3">$&</span>');

  const spanStack: string[] = [];
  
  // Basic Regex for generic 16 colors & simple SGR codes
  const replaceSgr = (_unused: string, p1: string) => {
    if (p1 === '0' || p1 === '') {
      const cls = spanStack.join('');
      spanStack.length = 0;
      return '</span>'.repeat(cls.split('<span').length - 1);
    }
    
    // We only map a subset of common colors for now
    const map: Record<string, string> = {
      '1': 'font-bold',
      '30': 'ansi-black', '31': 'ansi-red', '32': 'ansi-green', '33': 'ansi-yellow',
      '34': 'ansi-blue', '35': 'ansi-magenta', '36': 'ansi-cyan', '37': 'ansi-white',
      '90': 'ansi-bright-black', '91': 'ansi-bright-red', '92': 'ansi-bright-green', '93': 'ansi-bright-yellow',
      '94': 'ansi-bright-blue', '95': 'ansi-bright-magenta', '96': 'ansi-bright-cyan', '97': 'ansi-bright-white',
    };
    
    const codes = p1.split(';');
    let spanClasses = [];
    for (const code of codes) {
      if (map[code]) spanClasses.push(map[code]);
    }
    
    if (spanClasses.length > 0) {
      const tag = `<span class="${spanClasses.join(' ')}">`;
      spanStack.push(tag);
      return tag;
    }
    return ''; // Ignore unmapped
  };

  html = html.replace(/\x1b\[([0-9;]*)m/g, replaceSgr);
  
  // Close any unclosed spans
  if (spanStack.length > 0) {
    html += '</span>'.repeat(spanStack.length);
  }

  return html;
}

export function extractLogLines(fullLog: string): string[] {
  // Split by newline
  return fullLog.split('\n');
}
