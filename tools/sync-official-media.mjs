import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { newsArticles } from '../data/news.js';

const domain = 'stockportcountyfcservices.co.uk';
const imageBase = `https://images.gc.${domain}/`;
const root = new URL('../', import.meta.url);
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const manifest = { checkedAt: new Date().toISOString(), players: [], fixtures: [], news: [], images: [] };
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.json();
}
async function download(key, path) {
  if (!key) throw new Error(`Missing official image for ${path}`);
  const url = /^https:/.test(key) ? key : imageBase + key;
  try {
    const buffer = await readFile(new URL(path, root));
    if (buffer.length > 100) { manifest.images.push({path,source:url,bytes:buffer.length}); return path; }
  } catch {}
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Invalid image: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(new URL(path.substring(0, path.lastIndexOf('/') + 1), root), { recursive: true });
  await writeFile(new URL(path, root), buffer);
  manifest.images.push({ path, source: url, bytes: buffer.length });
  return path;
}
const squad = await json(`https://teams.football.web.gc.${domain}/v2/squads/opta?teamID=t48`);
const loans = await json(`https://teams.football.web.gc.${domain}/v2/loaned-out-players/team/t48/`);
const fixtures = await json(`https://matches.football.web.gc.${domain}/v2/opta/getupcoming?homeOrAway=Both&numberOfMatches=50&seasonID=2026&teamID=t48`);
const roles = { 'First-Team Head Coach': '主教练', 'Assistant Head Coach': '助理主教练', 'First-Team Coach': '一线队教练', 'Head of Goalkeeping': '门将教练主管', 'Head of Performance': '运动表现主管', 'Player Liaison Officer': '球员联络官', 'Tactical Coach Analyst': '战术分析教练' };
const tasks = [];
for (const [group, people] of Object.entries(squad.body)) {
  for (const p of people.filter(p => p.published)) {
    const name = `${p.firstName} ${p.surname}`;
    const key = p.playerProfileData?.squadImageKey;
    const path = `assets/official/squad/${slug(name)}.${key?.split('.').pop() || 'jpg'}`;
    const item = { name, group: group === 'staff' ? 'coaches' : group, number: group === 'staff' ? undefined : p.shirtNumber, role: roles[p.realPosition] || ({goalkeepers:'门将',defenders:'后卫',midfielders:'中场',forwards:'前锋'})[group], image: path, squadStatus: p.loan === '1' ? '租借' : undefined, onLoanFrom: p.onLoanFrom, playerID: p.playerID, sourceUrl: 'https://www.stockportcounty.com/teams/' };
    item.joinDate=p.joinDate;item.country=p.country;
    manifest.players.push(item);
    tasks.push(() => download(key, path));
  }
}
for (const {attributes:p} of loans.data.filter(x => x.attributes.published)) {
  const name = `${p.firstName} ${p.lastName}`;
  const existing = manifest.players.find(x => x.name === name);
  if (existing) { existing.squadStatus = '外租'; existing.loanClub = p.loanClub; continue; }
  const path = `assets/official/squad/${slug(name)}.${p.playerImageKey.split('.').pop()}`;
  manifest.players.push({name, number:p.squadNumber == null ? undefined : String(p.squadNumber),group:({Goalkeeper:'goalkeepers',Defender:'defenders',Midfielder:'midfielders',Forward:'forwards'})[p.squadPosition],role:({Goalkeeper:'门将',Defender:'后卫',Midfielder:'中场',Forward:'前锋'})[p.squadPosition],squadStatus:'外租',loanClub:p.loanClub,image:path,sourceUrl:'https://www.stockportcounty.com/teams/'});
  tasks.push(() => download(p.playerImageKey,path));
}
const teams = new Map();
for (const match of fixtures.body) {
  const home = match.teamData.find(t => t.side === 'Home');
  const away = match.teamData.find(t => t.side === 'Away');
  for (const team of [home, away]) if (!teams.has(team.teamID)) teams.set(team.teamID, team);
  manifest.fixtures.push({idEvent:match.matchID,dateEvent:match.kickOffUTC.slice(0,10),strTime:match.kickOffUTC.slice(11,19),strHomeTeam:home.teamName,strAwayTeam:away.teamName,strLeague:match.competitionName,strVenue:match.venue,strHomeTeamBadge:`assets/official/badges/${home.teamID}.png`,strAwayTeamBadge:`assets/official/badges/${away.teamID}.png`});
}
for (const [id, team] of teams) tasks.push(() => download(team.teamCrest,`assets/official/badges/${id}.png`));
for (const article of newsArticles.filter(a => a.sourceUrl)) {
  const officialSlug = new URL(article.sourceUrl).pathname;
  const result = await json(`https://news.cms.web.gc.${domain}/v1/byslug?postSlug=${encodeURIComponent(officialSlug)}`);
  const post = Array.isArray(result.body) ? result.body[0] : result.body;
  if (!post) { console.log(`News lookup unavailable: ${article.slug}`); continue; }
  await writeFile(new URL(`data/official-news-${article.slug}.json`,root),JSON.stringify(post,null,2));
  console.log(`News fields ${article.slug}: ${Object.keys(post || {}).join(',')}`);
  const key = post.imageData?.key || post.heroImageData?.key;
  if (key) {
    const path = `assets/official/news/${article.slug}.${key.split('.').pop()}`;
    manifest.news.push({slug:article.slug,image:path,sourceUrl:article.sourceUrl});
    tasks.push(() => download(key,path));
  }
}
let done = 0;
await Promise.all(Array.from({length:4}, async () => { while (tasks.length) { await tasks.shift()(); console.log(`Downloaded ${++done}`); } }));
await writeFile(new URL('data/official-media.json',root),JSON.stringify(manifest,null,2)+'\n');
console.log(`Saved ${manifest.players.length} portraits and ${teams.size} crests to ${fileURLToPath(root)}`);
