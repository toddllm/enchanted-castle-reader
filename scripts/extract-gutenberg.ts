import { promises as fs } from 'node:fs';
import path from 'node:path';

const sourcePath =
  process.env.BOOK_SOURCE ||
  '/Users/tdeshane/roni-ai/pg34219.txt';
const outputPath = path.resolve(process.cwd(), 'content', 'book.txt');

const raw = await fs.readFile(sourcePath, 'utf8');

const startIndex = raw.indexOf('CHAPTER I');
const endIndex = raw.indexOf('*** END OF THE PROJECT GUTENBERG EBOOK');

if (startIndex === -1 || endIndex === -1) {
  throw new Error('Unable to locate Gutenberg book boundaries.');
}

let text = raw.slice(startIndex, endIndex);

text = text.replace(/\r/g, '');
text = text.replace(/^\[Illustration[^\]]*]\s*$/gm, '');
text = text.replace(/^\s+$/gm, '');
text = text.replace(/\n{3,}/g, '\n\n');
text = text.replace(/\n\s*UNWIN BROTHERS[\s\S]*$/i, '');
text = text.replace(/\nTranscriber's Notes:[\s\S]*$/i, '');
text = text.trim();

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, text, 'utf8');

console.log(`Wrote cleaned book text to ${outputPath}`);
