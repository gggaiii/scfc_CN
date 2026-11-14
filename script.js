import {newsArticles} from './data/news.js';
import {squadPlayers} from './data/squad.js';
import {fixtureSnapshot} from './data/fixtures.js';
import fanContent from './data/fan-content.json' with {type:'json'};
import {initMatches,normalizeMatch,snapshotMatch} from './modules/matches.js';
import {initFilters} from './modules/filters.js';
import {initDetails} from './modules/details.js';
import {newsCard,playerCard} from './modules/cards.js';

const bundledAssets=import.meta.glob(['./assets/*','./assets/official/**/*'],{eager:true,import:'default',query:'?url'});
const prefix=/\/(news|squad|history)\//.test(location.pathname)?'../':'';
const paths={page:path=>prefix+path,asset:path=>bundledAssets[`./${path}`] || (/^https?:/.test(path)?path:prefix+path)};
document.addEventListener('error',event=>{
 const image=event.target;
 if(!(image instanceof HTMLImageElement)||!image.classList.contains('team-badge'))return;
 const fallback=document.createElement('span');fallback.className='team-badge';
 fallback.textContent=image.alt.replace(/队徽$/,'').slice(0,1)||'?';fallback.setAttribute('aria-label',image.alt);
 image.replaceWith(fallback);
},true);
const toggle=document.querySelector('[data-nav-toggle]'),nav=document.querySelector('[data-nav]');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'关闭导航':'打开导航');});
nav?.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){nav?.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');}});
const homeNews=document.querySelector('[data-home-news]');
if(homeNews){const pinned=newsArticles.find(a=>a.pinned)||newsArticles[0];const latest=newsArticles.filter(a=>a!==pinned).sort((a,b)=>(b.publishedAt||b.date).localeCompare(a.publishedAt||a.date)).slice(0,2);homeNews.innerHTML=[pinned,...latest].map((a,i)=>newsCard(a,paths,i===0)).join('');}
const featured=document.querySelector('[data-squad]');if(featured)featured.innerHTML=squadPlayers.filter(p=>p.leadership).map(p=>playerCard(p,paths)).join('');
initFilters({players:squadPlayers,articles:newsArticles,paths});
initDetails();
initMatches({upcoming:fixtureSnapshot.map(snapshotMatch),results:fanContent.results.map(normalizeMatch),table:fanContent.table,checkedAt:fanContent.checkedAt,tableUpdatedAt:fanContent.tableUpdatedAt,paths});
