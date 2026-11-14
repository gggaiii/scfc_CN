import source from '../data/fan-source.json' with {type:'json'};
import {newsTranslations} from '../data/news-translations.js';
import translationIds from '../data/news-translation-ids.json' with {type:'json'};
import {writeFile} from 'node:fs/promises';
const news=source.news.data.map(item=>{const i=translationIds.indexOf(item.id);if(i<0)throw Error(`Chinese summary required for new official article: ${item.attributes.postTitle}`);const a=item.attributes,[title,category,summary,body]=newsTranslations[i];return {id:item.id,slug:a.postSlugSuffix,date:a.publishedDateTime.slice(0,10),publishedAt:a.publishedDateTime,title,category,summary,body,sourceUrl:'https://www.stockportcounty.com'+a.postSlug,image:`assets/official/news/${item.id}.jpg`,pinned:i===1,relatedPlayers:i===0?['eoghan-o-connell']:i===1?['jack-diamond','ethan-ennis']:[]};});
const data={checkedAt:source.checkedAt,news,results:source.results.body,table:source.table.body.leagueTable.teamStandings,tableUpdatedAt:source.table.body.importUTCDateTime,kits:source.kits.map((p,i)=>({title:['2026/27 主场球衣','2026/27 客场球衣','2026/27 第三球衣'][i],url:'https://store.stockportcounty.com/products/'+p.handle,image:`assets/official/shop/${p.handle}.webp`}))};
await writeFile(new URL('../data/fan-content.json',import.meta.url),JSON.stringify(data,null,2));
