import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.astro')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('import { GitHub }') || content.includes('<GitHub')) {
                console.log(`Fixing ${fullPath}`);
                content = content.replace(/import \{ (.*)GitHub(.*) \} from 'lucide-react'/g, "import { $1Github$2 } from 'lucide-react'");
                content = content.replace(/<GitHub /g, '<Github ');
                content = content.replace(/<\/GitHub>/g, '</Github>');
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

walk(root);
