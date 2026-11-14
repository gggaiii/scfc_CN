import {writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const domain='stockportcountyfcservices.co.uk';
const endpoints={news:`https://news.cms.web.gc.${domain}/v2/search?page.size=12&sort=publishedDateTime:desc`,results:`https://matches.football.web.gc.${domain}/v2/opta/getlastresults?teamID=t48&numberOfFixtures=10`,table:`https://league-tables.football.web.gc.${domain}/v1/opta?competitionID=11&teamID=t48&seasonID=2026`,products:'https://store.stockportcounty.com/products.json?limit=250'};
const data={checkedAt:new Date().toISOString()};
for(const [key,url] of Object.entries(endpoints)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${key}: ${r.status}`);data[key]=await r.json();}
const imageTasks=[];
for(const item of data.news.data){const r=await fetch(`https://news.cms.web.gc.${domain}/v1/${item.id}`);const full=await r.json();item.full=Array.isArray(full.body)?full.body[0]:full.body;imageTasks.push([`https://images.gc.${domain}/${item.attributes.imageData.key}`,`assets/official/news/${item.id}.jpg`]);}
data.kits=['26-27-home-shirt','26-27-away-shirt','26-27-third-shirt'].map(handle=>data.products.products.find(p=>p.handle===handle));
for(const p of data.kits)imageTasks.push([p.images[0].src,`assets/official/shop/${p.handle}.webp`]);
for(const m of data.results.body)for(const t of m.teamData){const key=t.teamCrest||t.teamCrest_Custom?.key;const id=t.teamID||(t.teamName==='Stockport County'?'t48':`custom-${t.teamCrest_CustomID}`);if(key)imageTasks.push([`https://images.gc.${domain}/${key}`,`assets/official/badges/${id}.png`]);}
await Promise.all(imageTasks.map(async([url,path])=>{const r=await fetch(url);if(!r.ok)throw Error(url);await mkdir(new URL(path.slice(0,path.lastIndexOf('/')+1),root),{recursive:true});await writeFile(new URL(path,root),Buffer.from(await r.arrayBuffer()));}));
await writeFile(new URL('data/fan-source.json',root),JSON.stringify(data,null,2));
console.log('Feeds saved');
