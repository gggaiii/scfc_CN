import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {squadPlayers} from '../data/squad.js';
import {playerProfiles} from '../data/player-profiles.js';

assert.equal(Object.keys(playerProfiles).length, squadPlayers.length);
for(const player of squadPlayers){
 assert.ok(playerProfiles[player.slug], `Missing biography: ${player.name}`);
 assert.ok(player.shortIntro.length<=80, `Card introduction too long: ${player.name}`);
 assert.ok(player.detailSections.length>=(player.group==='coaches'?2:3), player.name);
 const text=player.detailSections.flatMap(section=>section.paragraphs).join('');
 assert.ok(text.length>=(player.group==='coaches'?110:170), `Sparse biography: ${player.name}`);
 assert.ok(!text.includes('郡队'), player.name);
 assert.ok(player.profileSources.length>0, `Missing sources: ${player.name}`);
 for(const source of player.profileSources){assert.equal(new URL(source.url).protocol,'https:');assert.ok(!/undefined|NaN/.test(source.label),player.name);}
 const html=await readFile(new URL(`../squad/${player.slug}.html`,import.meta.url),'utf8');
 for(const section of player.detailSections){assert.ok(html.includes(section.title),player.name);for(const paragraph of section.paragraphs)assert.ok(html.includes(paragraph),player.name);}
 assert.ok(html.includes('profile-sources'), player.name);
 if(player.group!=='coaches')assert.ok(!html.includes('>STAFF</span>'), `Player incorrectly marked as staff: ${player.name}`);
}
assert.equal(squadPlayers.find(p=>p.slug==='ben-hinchliffe').detailSections.length,10);
assert.equal(squadPlayers.find(p=>p.slug==='oliver-norwood').detailSections.length,8);
assert.deepEqual(squadPlayers.filter(p=>p.leadership==='队长').map(p=>p.slug),['oliver-norwood']);
assert.ok(!squadPlayers.find(p=>p.slug==='lewis-bate').leadership);
assert.equal(squadPlayers.filter(p=>p.squadStatus==='外租').length,5);
assert.equal(squadPlayers.find(p=>p.slug==='ollie-whatmuff').squadStatus,'租借');

if(process.argv[2]){
 const {chromium}=createRequire(import.meta.url)(process.argv[2]);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   for(const player of squadPlayers){
    await page.goto(`${process.argv[3] || 'http://127.0.0.1:4173'}/squad/${player.slug}.html`);
    assert.equal(await page.locator('.player-detail-section').count(),player.detailSections.length, player.name);
    assert.equal(await page.locator('.profile-sources a').count(),player.profileSources.length, player.name);
    assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),`${width}: ${player.name}`);
    const portrait=page.locator('.player-profile-card > img');await portrait.evaluate(img=>img.decode());
    assert.ok(await portrait.evaluate(img=>img.naturalWidth>0 && getComputedStyle(img).objectPosition.endsWith('0%')), player.name);
   }
   if(process.argv[4]){
    await mkdir(process.argv[4],{recursive:true});
    for(const slug of ['ollie-whatmuff','corey-addai','oliver-norwood']){
     await page.goto(`${process.argv[3]}/squad/${slug}.html`);
     await page.screenshot({path:`${process.argv[4]}/${slug}-${width}.png`,fullPage:true});
    }
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
}
console.log(JSON.stringify({members:squadPlayers.length,players:squadPlayers.filter(p=>p.group!=='coaches').length,coaches:squadPlayers.filter(p=>p.group==='coaches').length,biographies:'complete',longProfiles:'preserved',checks:'passed'}));
