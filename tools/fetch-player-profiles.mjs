import {writeFile} from 'node:fs/promises';

const base='https://teams.football.web.gc.stockportcountyfcservices.co.uk';
const playerBase='https://players.football.web.gc.stockportcountyfcservices.co.uk';
async function json(url,optional=false){
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(optional&&response.status===404)return {};
 if(!response.ok)throw new Error(`${response.status}: ${url}`);
 return response.json();
}
const roster=await json(`${base}/v2/squads/opta?teamID=t48`);
const loans=await json(`${base}/v2/loaned-out-players/team/t48/`);
const players=Object.entries(roster.body).flatMap(([group,people])=>people.filter(p=>p.published).map(p=>({name:`${p.firstName} ${p.surname}`,group,slug:p.playerSlug,playerID:p.playerID,joinDate:p.joinDate,country:p.country,number:p.shirtNumber,role:p.realPosition,onLoanFrom:p.onLoanFrom,biography:p.playerProfileData?.biography || '',sourceUrl:`https://www.stockportcounty.com/teams/men/${p.playerSlug}`,apiUrl:`${base}/v2/squads/opta?teamID=t48`})));
for(const {attributes:p} of loans.data.filter(p=>p.attributes.published)){
 const name=`${p.firstName} ${p.lastName}`;
 const existing=players.find(player=>player.name===name);
 if(existing){existing.loanClub=p.loanClub;continue;}
 const slug=(p.firstName+p.lastName).toLowerCase().replace(/[^a-z]/g,'');
 const apiUrl=`${playerBase}/v1/opta/getsingle?playerSlug=${slug}&teamID=t48`;
 const result=await json(apiUrl,true);
 const profile=Array.isArray(result.body)?result.body[0]:result.body;
 players.push({name,group:p.squadPosition,slug,loanClub:p.loanClub,loanEnds:p.loanEnds,biography:profile?.playerProfileData?.biography || '',joinDate:profile?.joinDate,country:profile?.country,sourceUrl:`https://www.stockportcounty.com/teams/men/${slug}`,apiUrl});
}
await writeFile(new URL('../data/official-player-profiles.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),players},null,2)+'\n');
console.log(JSON.stringify(players.map(p=>({name:p.name,characters:p.biography.length})),null,2));
