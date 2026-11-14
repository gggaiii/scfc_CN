import {writeFile} from 'node:fs/promises';

const paths=[
 '/news/2026/june/05/jimmy-mcnulty-appointed-as-new-head-coach/',
 '/news/2026/august/11/owen-dogson-joins-stags-on-loan/',
 '/news/2026/may/27/released-and-retained-list-confirmed/',
 '/news/2025/february/03/moxon-completes-deadline-day-business',
 '/news/2026/august/28/moxon-departs-on-loan/',
 '/news/2025/july/02/county-smash-transfer-record-for-one-of-efls-biggest-talents',
 '/news/2026/august/27/malik-joins-chairboys-on-loan/',
 '/news/2022/july/04/county-complete-camps-capture',
 '/news/2026/october/28/camps-joins-cumbrians-on-loan/',
 '/news/2026/july/15/corey-joins-brewers-on-loan/',
 '/news/2024/june/27/promotion-winner-addai-joins-goalkeeping-ranks',
];
const articles=[];
for(const path of paths){
 const response=await fetch(`https://news.cms.web.gc.stockportcountyfcservices.co.uk/v1/byslug?postSlug=${encodeURIComponent(path)}`,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`${response.status}: ${path}`);
 const data=await response.json();const article=Array.isArray(data.body)?data.body[0]:data.body;
 if(!article)throw new Error(`Article unavailable: ${path}`);
 articles.push({sourceUrl:'https://www.stockportcounty.com'+path,article});
}
await writeFile(new URL('../data/profile-news-sources.json',import.meta.url),JSON.stringify(articles,null,2)+'\n');
console.log(`Saved ${articles.length} official profile sources.`);
