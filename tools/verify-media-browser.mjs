import { createRequire } from 'node:module';
import { squadPlayers } from '../data/squad.js';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2]);
const base = process.argv[3] || 'http://127.0.0.1:5174';
const output = process.argv[4];
const browser = await chromium.launch({headless:true, channel:'msedge'});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/eventsnext.php*', route => route.fulfill({json:{events:[]}}));
async function inspect(path) {
  await page.goto(base + path);
  const failures = await page.locator('img').evaluateAll(async images => {
    for(const img of images) img.loading = 'eager';
    await Promise.all(images.map(img => img.decode().catch(()=>{})));
    return images.filter(img=>!img.naturalWidth).map(img=>({src:img.src,alt:img.alt}));
  });
  if(failures.length) errors.push({path,failures});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
await inspect('/squad/index.html');
const cards = await page.locator('.mini-player-card').count();
const links = await page.locator('.mini-player-card').evaluateAll(cards=>cards.map(card=>new URL(card.href).pathname));
if(cards !== squadPlayers.length) errors.push(`Expected ${squadPlayers.length}, found ${cards}`);
if(output) {await mkdir(output,{recursive:true}); await page.locator('.mini-player-grid').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await page.screenshot({path:output+'/squad-desktop.png'});}
for(const link of links) await inspect(link);
await inspect('/');
const badges = await page.locator('.fixture-card .team-badge').count();
if(!badges) errors.push('No opponent crests rendered');
if(output) {await page.locator('#fixtures').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/fixtures-desktop.png'});}
await inspect('/news/index.html');
await page.setViewportSize({width:390,height:844});
await inspect('/squad/index.html');
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) errors.push('Mobile horizontal overflow');
if(output) await page.screenshot({path:output+'/squad-mobile.png'});
await browser.close();
console.log(JSON.stringify({cards,detailPages:links.length,badges,errors},null,2));
if(errors.length) process.exitCode=1;
