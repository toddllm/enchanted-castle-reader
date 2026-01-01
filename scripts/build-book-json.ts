import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBookContent } from '../client/src/lib/book-parser';
import { rawBookContent } from '../client/src/lib/book-content';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'client', 'src', 'data', 'book.json');

const chapters = parseBookContent(rawBookContent);
const payload = { chapters };

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

console.log(`Wrote ${outputPath} with ${chapters.length} chapters.`);
