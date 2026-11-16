import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const files = walk('src').filter(f => f.endsWith('.astro'));

const replacements = [
    ['href="/learn/reading-a-byte"', 'href="/learn/reading-a-byte/"'],
    ['href="/learn/binary-hex-decimal"', 'href="/learn/binary-hex-decimal/"'],
    ['href="/learn/bits-and-bytes"', 'href="/learn/bits-and-bytes/"'],
    ['href="/learn/writing-a-byte#dont-forget-to-pad"', 'href="/learn/writing-a-byte/#dont-forget-to-pad"'],
    ['href="/learn/what-is-binary"', 'href="/learn/what-is-binary/"'],
    ['href="/contact"', 'href="/contact/"'],
    ['href="/quick-byte"', 'href="/quick-byte/"'],
    ['href="/how-to-play"', 'href="/how-to-play/"'],
    ['href="/5-bit"', 'href="/5-bit/"'],
    ['href="/overclocked"', 'href="/overclocked/"'],
    ['href="/learn"', 'href="/learn/"'],
    ['href="/tools/student-picker"', 'href="/tools/student-picker/"']
];

let count = 0;
for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let changed = false;
    for (const [old, newStr] of replacements) {
        if (content.includes(old)) {
            content = content.replaceAll(old, newStr);
            changed = true;
        }
    }
    if (changed) {
        writeFileSync(file, content);
        count++;
        console.log(`Fixed links in: ${file}`);
    }
}
console.log(`\n✅ Done! Updated links in ${count} files.`);