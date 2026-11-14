import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {squadPlayers} from '../data/squad.js';
import {newsArticles} from '../data/news.js';
import {fixtureSnapshot} from '../data/fixtures.js';
import {calendarText,matchStatus} from '../modules/matches.js';
const {chromium}=createRequire(import.meta.url)(process.argv[2]);
const base=process.argv[3]||'http://127.0.0.1:4173',out=process.argv[4];
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/v2/opta/getupcoming?**',route=>route.fulfill({status:503,body:'Offline test'}));
const page=await context.newPage(),errors=[],broken=[];
page.on('pageerror',error=>errors.push(error.message));
async function visit(path){await page.goto(base+path);await page.locator('img').evaluateAll(async imgs=>{for(const i of imgs)i.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});const fails=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src));broken.push(...fails);}
async function shot(name){if(out){await mkdir(out,{recursive:true});await page.waitForTimeout(250);await page.screenshot({path:`${out}/${name}.png`});}}
await visit('/');assert.equal(await page.locator('[data-home-news] .editorial-story').count(),3);await shot('home-desktop');
await page.getByRole('tab',{name:'最近赛果'}).click();assert.equal(await page.locator('.match-row').count(),10);await page.locator('.match-row details').first().locator('summary').click();assert.ok((await page.locator('.match-detail').first().innerText()).includes('点球大战'));
await page.getByRole('tab',{name:'未来赛程'}).click();await page.locator('.match-row details').first().locator('summary').click();const download=page.waitForEvent('download');await page.locator('[data-calendar]').first().click();await download;
await page.locator('[data-side]').selectOption('away');assert.ok((await page.locator('.match-row .card-meta').first().innerText()).includes('客场'));await page.locator('[data-side]').selectOption('');await page.locator('.match-controls').scrollIntoViewIfNeeded();await shot('matches-desktop');
await visit('/squad/index.html');assert.equal(await page.locator('.mini-player-card').count(),squadPlayers.length);await page.getByRole('searchbox').fill('诺伍德');assert.equal(await page.locator('.mini-player-card').count(),1);await page.locator('.quick-profile summary').click();await page.locator('[data-save]').click();await page.locator('input[name=saved]').check();assert.equal(await page.locator('.mini-player-card').count(),1);await page.reload();assert.equal(await page.getByRole('searchbox').inputValue(),'诺伍德');assert.equal(await page.locator('.mini-player-card').count(),1);await page.getByRole('button',{name:'重置',exact:true}).click();await page.locator('select[name=status]').selectOption('loan');assert.equal(await page.locator('.mini-player-card').count(),squadPlayers.filter(p=>p.squadStatus==='外租').length);await page.getByRole('searchbox').fill('no-player-xyz');assert.ok(await page.locator('.empty-state').isVisible());await page.getByRole('button',{name:'重置',exact:true}).click();await page.locator('.mini-player-grid').first().scrollIntoViewIfNeeded();await shot('squad-desktop');
for(const p of squadPlayers){await visit(`/squad/${p.slug}.html`);assert.ok(await page.locator('.player-portrait').count() || await page.locator('main img').count());}
await visit('/news/index.html');assert.equal(await page.locator('.editorial-story').count(),6);await page.getByRole('button',{name:'加载更多'}).click();assert.equal(await page.locator('.editorial-story').count(),12);await page.getByRole('searchbox').fill('女足');assert.equal(await page.locator('.editorial-story').count(),1);
for(const a of newsArticles)await visit(`/news/${a.slug}.html`);
await visit('/history/index.html');await page.getByRole('button',{name:'复兴',exact:true}).click();assert.equal(await page.locator('[data-history-era]:visible').count(),3);await page.locator('.history-story:visible summary').first().click();await shot('history-desktop');
for(const width of [768,390]){await page.setViewportSize({width,height:900});for(const path of ['/','/squad/index.html','/news/index.html','/history/index.html','/squad/oliver-norwood.html']){await visit(path);assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),`Overflow ${width} ${path}`);if(width===390)await shot(`mobile-${path.replace(/[^a-z]/g,'') || 'home'}`);}await page.locator('[data-nav-toggle]').click();assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'),'true');}
const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();for(const [path,selector]of [['/squad/index.html','.mini-player-card'],['/news/index.html','.editorial-story'],['/','.match-row']]){await staticPage.goto(base+path);assert.ok(await staticPage.locator(selector).count()>0,`Empty static ${path}`);}await nojs.close();
assert.match(calendarText({id:'test',kickoff:'2026-12-01T19:45:00Z',home:'Stockport County',away:'Reading',venue:'Edgeley Park'}),/DTSTART:20261201T194500Z/);
assert.equal(matchStatus({status:'Postponed'}),'延期');assert.equal(matchStatus({status:'Cancelled'}),'取消');assert.equal(matchStatus({status:'PreMatch',kickoff:null}),'时间待定');
await page.setViewportSize({width:1440,height:1000});await visit('/squad/index.html');
assert.ok(await page.locator('.portrait-link img').evaluateAll(imgs=>imgs.every(img=>{const r=img.getBoundingClientRect();return Math.abs(r.width-r.height)<2 && /(?:top| 0%)$/.test(getComputedStyle(img).objectPosition);})), 'Portraits must remain square and top aligned');
const sample=fixtureSnapshot[0];
await context.unroute('**/v2/opta/getupcoming?**');
await context.route('**/v2/opta/getupcoming?**',route=>route.fulfill({headers:{'access-control-allow-origin':'*'},json:{body:[{matchID:sample.idEvent,kickOffUTC:`${sample.dateEvent}T${sample.strTime}Z`,teamData:[{side:'Home',teamID:'t48',teamName:'Stockport County'},{side:'Away',teamID:'t108',teamName:'Reading'}],competitionName:'English League 1',venue:'Edgeley Park',period:'PreMatch'}]}}));
await visit('/');await page.locator('[data-live-state]').filter({hasText:'已刷新赛程'}).waitFor();assert.equal(await page.locator('.match-row').count(),1);
await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);console.log(JSON.stringify({profiles:squadPlayers.length,articles:newsArticles.length,viewports:[1440,768,390],staticPages:3,errors,broken},null,2));
