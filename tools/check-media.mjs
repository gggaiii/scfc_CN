import { readFile, stat } from 'node:fs/promises';
import { squadPlayers } from '../data/squad.js';
import { fixtureSnapshot } from '../data/fixtures.js';
import { newsArticles } from '../data/news.js';
const root = new URL('../', import.meta.url);
const errors = [];
const images = new Set();
for (const person of squadPlayers) {
  if (!person.image?.startsWith('assets/official/squad/')) errors.push(`Non-official portrait: ${person.name}`);
  images.add(person.image);
}
for (const fixture of fixtureSnapshot) for (const side of ['Home','Away']) images.add(fixture[`str${side}TeamBadge`]);
for (const article of newsArticles.filter(a => a.sourceUrl)) {
  if (!article.image.startsWith('assets/official/news/')) errors.push(`Unmatched news image: ${article.slug}`);
  images.add(article.image);
}
let totalBytes = 0;
for (const path of images) {
  try {
    const buffer = await readFile(new URL(path, root));
    const jpeg = buffer[0] === 255 && buffer[1] === 216;
    const png = buffer.subarray(1,4).toString() === 'PNG';
    if (!jpeg && !png) errors.push(`Invalid image signature: ${path}`);
    totalBytes += (await stat(new URL(path,root))).size;
  } catch { errors.push(`Missing: ${path}`); }
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(JSON.stringify({portraits:squadPlayers.length,fixtures:fixtureSnapshot.length,officialNews:newsArticles.filter(a=>a.sourceUrl).length,uniqueImages:images.size,totalBytes,errors},null,2));
