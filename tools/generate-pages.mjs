import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { newsArticles } from "../data/news.js";
import { squadPlayers } from "../data/squad.js";
import {squadMarkup,playerCard,newsCard} from '../modules/cards.js';
import {bookmark,personSlug} from '../modules/core.js';
import {fixtureSnapshot} from '../data/fixtures.js';
import {fixtureCard,snapshotMatch} from '../modules/matches.js';
import {clubHistory} from '../data/history.js';
import fanContent from '../data/fan-content.json' with {type:'json'};
import {translateText} from '../modules/i18n.js';

const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const pageImage = (path) => {
  if (!path) return "../assets/stockport-county-fc-logo.png";
  if (/^https?:\/\//i.test(path) || path.startsWith("../") || path.startsWith("/")) return path;
  return `../${path}`;
};

const roleLine = (player) => {
  const role = player.leadership && player.leadership !== player.role ? `${player.leadership} · ${player.role}` : player.role;
  return player.number ? `${player.number}号 · ${role}` : role;
};

const statusBadge = (player) => (player.squadStatus ? `<span class="squad-status">${escapeHtml(player.squadStatus)}</span>` : "");
const countries = {England:'英格兰',Scotland:'苏格兰','Northern Ireland':'北爱尔兰','Republic of Ireland':'爱尔兰',Iceland:'冰岛',France:'法国',Gambia:'冈比亚',Jamaica:'牙买加'};

const playerDetailMarkup = (player) => {
  if (player.detailSections?.length) {
    return `
            ${
              player.highlights?.length
                ? `<div class="player-highlight-grid">
                  ${player.highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("\n                  ")}
                </div>`
                : ""
            }
            <section class="player-detail-box player-detail-rich">
              <h2>详细介绍</h2>
              ${player.detailSections
                .map(
                  (section) => `
                <div class="player-detail-section">
                  <h3>${escapeHtml(section.title)}</h3>
                  ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n                  ")}
                </div>`,
                )
                .join("\n")}
            </section>`;
  }

  return `
            <section class="player-detail-box">
              <h2>详细介绍</h2>
              <p>${escapeHtml(player.detail || player.intro)}</p>
            </section>`;
};

const header = (sectionLabel) => `
    <header class="site-header" data-header>
      <a class="brand" href="../index.html" aria-label="返回斯托克波特郡中文主页">
        <img class="brand-mark" src="../assets/stockport-county-fc-logo.png" alt="" />
        <span>
          <strong>斯托克波特郡足球俱乐部</strong>
          <small>${escapeHtml(sectionLabel)}</small>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-label="打开导航" aria-expanded="false" data-nav-toggle><span></span><span></span><span></span></button>
      <nav class="main-nav" data-nav>
        <a href="../index.html">首页</a>
        <a href="../index.html#fixtures">比赛</a>
        <a href="../news/index.html">新闻</a>
        <a href="../squad/index.html">阵容</a>
        <a href="../history/index.html">历史</a>
        <a href="../index.html#shop">商店</a>
      </nav>
    </header>`;

const footer = (backHref, backText) => `
    <footer class="site-footer">
      <p>© 2026 斯托克波特郡足球俱乐部中文球迷主页。</p>
      <div>
        <a href="${escapeHtml(backHref)}">${escapeHtml(backText)}</a>
        <a href="../index.html">首页</a>
      </div>
    </footer>

    <script type="module" src="../script.js"></script>`;

const documentShell = ({ title, description, sectionLabel, body, backHref, backText }) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | 斯托克波特郡足球俱乐部中文主页</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" type="image/png" href="../assets/stockport-county-fc-logo.png" />
    <link rel="apple-touch-icon" href="../assets/stockport-county-fc-logo.png" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="../experience.css" />
  </head>
  <body>
${header(sectionLabel)}

    <main>
${body}
    </main>

${footer(backHref, backText)}
  </body>
</html>
`;

await mkdir(new URL("../news/", import.meta.url), { recursive: true });
await mkdir(new URL("../squad/", import.meta.url), { recursive: true });

for (const article of newsArticles) {
  const related=newsArticles.filter(a=>a.slug!==article.slug).sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)||b.date.localeCompare(a.date)).slice(0,3);
  const body = `      <section class="section detail-section">
        <article class="detail-article">
          <a class="breadcrumb" href="index.html">新闻中心 / ${escapeHtml(article.category)}</a>
          <img src="${escapeHtml(pageImage(article.image))}" alt="${escapeHtml(article.title)}" />
          <p class="tag">${escapeHtml(article.category)} · ${escapeHtml(article.date)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          <div class="article-tools"><span>约 ${Math.max(1,Math.ceil(article.body.join('').length/350))} 分钟阅读 · 中文摘要</span>${bookmark(`news:${article.slug}`,article.title)}</div>
          <nav class="article-toc" aria-label="文章目录"><a href="#overview">中文导读</a><a href="#source">官方来源</a><a href="#related">继续阅读</a></nav>
          <section id="overview"><h2>中文导读</h2>${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}</section>
          <div id="source" class="source-note"><p>依据俱乐部官方报道整理。发布日期：${article.date}。</p>
          ${article.sourceUrl ? `<a class="button primary" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">查看官方原文</a>` : ""}
          <a class="quiet-button" href="index.html">返回新闻列表</a></div>
          ${article.relatedPlayers?.length?`<p>相关人物：${article.relatedPlayers.map(id=>{const p=squadPlayers.find(p=>p.slug===id);return p?`<a class="text-link" href="../squad/${id}.html">${escapeHtml(p.zhName||p.name)}</a>`:'';}).join(' · ')}</p>`:''}
        </article>
      </section><section class="section" id="related"><div class="section-heading"><p class="eyebrow">继续阅读</p><h2>更多帽匠故事</h2></div><div class="related-grid">${related.map(a=>newsCard(a,{asset:pageImage,page:p=>'../'+p})).join('')}</div></section>`;

  await writeFile(
    new URL(`../news/${article.slug}.html`, import.meta.url),
    documentShell({
      title: article.title,
      description: article.summary,
      sectionLabel: "新闻详情",
      body,
      backHref: "index.html",
      backText: "返回新闻中心",
    }),
  );
}

for (const player of squadPlayers) {
  const slug = personSlug(player);
  const group=squadPlayers.filter(p=>p.group===player.group),index=group.indexOf(player);
  const adjacent=[group[(index-1+group.length)%group.length],group[(index+1)%group.length]].filter((p,i,a)=>p!==player&&a.indexOf(p)===i);
  const body = `      <section class="section detail-section">
        <article class="player-profile-card">
          <img src="${escapeHtml(pageImage(player.image))}" alt="${escapeHtml(player.name)}" />
          <div>
            ${statusBadge(player)}
            <p class="tag">${escapeHtml(roleLine(player))}</p>
            <h1>${escapeHtml(player.zhName || player.name)}</h1>
            ${player.zhName?`<p class="english-name">${escapeHtml(player.name)}</p>`:''}
            <p class="player-summary">${escapeHtml(player.shortIntro || player.intro)}</p>
            ${bookmark(`player:${slug}`,player.zhName||player.name)}
            ${player.profileNote ? `<p class="profile-note">${escapeHtml(player.profileNote)}</p>` : ""}
            ${player.number ? `<p class="player-number">球衣号码：${escapeHtml(player.number)}号</p>` : ""}
${playerDetailMarkup(player)}
            ${player.profileSources?.length?`<aside class="profile-sources" aria-label="资料来源"><h2>资料来源</h2><ul>${player.profileSources.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a></li>`).join('')}</ul><p>中文内容按主题整理；不同赛季的经历与当前身份分别说明。</p></aside>`:''}
            <dl class="player-facts"><div><dt>目前职务 / 位置</dt><dd>${escapeHtml(player.role)}</dd></div>${player.country?`<div><dt>国家 / 地区</dt><dd>${escapeHtml(countries[player.country] || player.country)}</dd></div>`:''}${player.joinLabel || player.joinDate?`<div><dt>加盟记录</dt><dd>${escapeHtml(player.joinLabel || player.joinDate)}</dd></div>`:''}${player.loanClub?`<div><dt>外租至</dt><dd>${escapeHtml(translateText(player.loanClub))}</dd></div>`:''}${player.onLoanFrom?`<div><dt>租借自</dt><dd>${escapeHtml(translateText(player.onLoanFrom))}</dd></div>`:''}</dl>
            <details class="career-timeline"><summary>生涯时间线</summary><ol>${player.detailSections?player.detailSections.map(s=>`<li><strong>${escapeHtml(s.title)}</strong><p>${escapeHtml(s.paragraphs[0])}</p></li>`).join(''):player.joinDate?`<li><strong>${escapeHtml(player.joinDate)} · 加盟帽匠</strong><p>加盟日期来自官方人物档案。</p></li>`:''}<li><strong>2026/27赛季</strong><p>${escapeHtml(player.squadStatus==='外租'?`外租至 ${translateText(player.loanClub)}`:`斯托克波特郡${player.role}`)}。</p></li></ol></details>
            <a class="button primary" href="index.html">返回阵容</a>
          </div>
        </article>
      </section><section class="section"><div class="section-heading"><p class="eyebrow">继续认识球队</p><h2>同位置成员</h2></div><div class="profile-neighbours">${adjacent.map((p,i)=>`<a href="${p.slug}.html"><span>${i?'下一位':'上一位'}</span><strong>${escapeHtml(p.zhName||p.name)}</strong></a>`).join('')}</div><div class="related-grid">${group.filter(p=>p!==player).slice(0,3).map(p=>playerCard(p,{asset:pageImage,page:p=>'../'+p})).join('')}</div></section>`;

  await writeFile(
    new URL(`../squad/${slug}.html`, import.meta.url),
    documentShell({
      title: `${player.name} 资料`,
      description: player.shortIntro || player.intro,
      sectionLabel: "球员资料",
      body,
      backHref: "index.html",
      backText: "返回阵容",
    }),
  );
}

// Preserve legacy URLs without publishing obsolete roster portraits.
const currentPages = new Set(squadPlayers.map(p => `${slugify(p.name)}.html`));
for (const file of await readdir(new URL('../squad/', import.meta.url))) {
  if (!file.endsWith('.html') || file === 'index.html' || currentPages.has(file)) continue;
  await writeFile(new URL(`../squad/${file}`, import.meta.url), `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=index.html"><title>球队阵容</title></head><body><a href="index.html">查看最新球队阵容</a></body></html>`);
}

function replaceContainer(html,attribute,content){
  const open=new RegExp(`<div[^>]*\\s${attribute}(?:\\s|>)[^>]*>`).exec(html);
  if(!open)throw Error(`Missing container ${attribute}`);
  let depth=1,end=open.index+open[0].length;
  const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=end;
  for(let match;(match=tags.exec(html));){depth+=match[0].startsWith('</')?-1:1;if(!depth){return html.slice(0,end)+content+html.slice(match.index);}}
  throw Error(`Unclosed container ${attribute}`);
}
const childPaths={asset:pageImage,page:p=>'../'+p};
const pinned=newsArticles.find(a=>a.pinned)||newsArticles[0];
const homeArticles=[pinned,...newsArticles.filter(a=>a!==pinned).sort((a,b)=>(b.publishedAt||b.date).localeCompare(a.publishedAt||a.date)).slice(0,2)];
for(const [folder,title,intro,content] of [
 ['squad','一线队阵容','2026/27赛季 · 一线队、教练团队与外租球员',`<div class="squad-groups" data-squad-full>${squadMarkup(squadPlayers,childPaths)}</div>`],
 ['news','新闻中心','比赛、人物与社区，来自俱乐部的最新消息。',`<div class="article-grid" data-news-list>${newsArticles.slice(0,6).map(a=>newsCard(a,childPaths)).join('')}</div>`]
]){
 await writeFile(new URL(`../${folder}/index.html`,import.meta.url),documentShell({title,description:intro,sectionLabel:title,body:`<section class="browse-hero section"><p class="eyebrow">STOCKPORT COUNTY · 2026/27</p><h1>${title}</h1><p>${intro}</p></section><section class="section browse-section">${content}</section>`,backHref:'../index.html',backText:'返回首页'}));
}
const homepageUrl=new URL('../index.html',import.meta.url);
let homepage=await readFile(homepageUrl,'utf8');
homepage=replaceContainer(homepage,'data-squad',squadPlayers.filter(p=>p.leadership).map(p=>playerCard(p)).join(''));
homepage=replaceContainer(homepage,'data-home-news',homeArticles.map((a,i)=>newsCard(a,{},i===0)).join(''));
homepage=replaceContainer(homepage,'data-fixtures',fixtureSnapshot.filter(m=>Date.parse(`${m.dateEvent}T${m.strTime}Z`)>Date.now()).slice(0,5).map((m,i)=>fixtureCard(snapshotMatch(m),{asset:s=>s},i===0)).join(''));
if(!homepage.includes('data-season'))homepage=homepage.replace(/(<section[^>]+id="news">)/,`<section class="section season-overview" data-season><h2>2026/27 赛季概览</h2><p>英甲积分榜与最近战绩。</p></section>$1`);
homepage=homepage.replace(/(<section[^>]*data-season>)[\s\S]*?(<\/section>)/,(_match,open,close)=>`${open}<h2>2026/27 赛季概览</h2><div class="table-scroll"><table class="league-table"><caption>官网积分榜 · ${fanContent.tableUpdatedAt.slice(0,10)}</caption><thead><tr><th>排名</th><th>球队</th><th>已赛</th><th>积分</th></tr></thead><tbody>${fanContent.table.slice(0,6).map(r=>`<tr class="${r.teamID==='t48'?'our-club':''}"><td>${r.position}</td><th scope="row">${escapeHtml(translateText(r.teamName))}</th><td>${r.played}</td><td>${r.points}</td></tr>`).join('')}</tbody></table></div>${close}`);
homepage=homepage.replace('我们的下一场比赛将要迎战：','埃奇利公园与每一程客场。赛程、赛果和比赛日，都在这里。');
homepage=homepage.replace(/(<p class="hero-copy">)[\s\S]*?(<\/p>)/,`$1跟随帽匠的2026/27赛季，从每一场比赛、每一位球员，读懂这座城的蓝白故事。$2`);
if(!homepage.includes('hero-news-link'))homepage=homepage.replace('</div>\n        </div>\n      </section>',`</div><a class="hero-news-link" href="news/${homeArticles[0].slug}.html"><span>最新焦点</span> ${escapeHtml(homeArticles[0].title)} →</a>\n        </div>\n      </section>`);
const historyPreview=clubHistory.filter(h=>['2019','2022','2024','2026'].includes(h.year)).map(h=>`<details class="history-item"><summary><time>${h.year}</time><strong>${h.title}</strong><span aria-hidden="true">＋</span></summary><p>${h.text}</p>${h.person?`<a href="squad/${h.person}.html">认识相关人物 →</a>`:''}</details>`).join('');
homepage=homepage.replace(/<ol class="timeline">[\s\S]*?<\/ol>/,`<div class="history-preview">${historyPreview}</div><a class="text-link" href="history/index.html">走进完整球队历史 →</a>`);
homepage=homepage.replace(/<div class="history-preview">[\s\S]*?<\/div><a class="text-link" href="history\/index.html">[^<]*<\/a>/,`<div class="history-preview">${historyPreview}</div><a class="text-link" href="history/index.html">走进完整球队历史 →</a>`);
homepage=homepage.replace(/<section[^>]+id="shop">[\s\S]*?<\/section>/,`<section class="section shop-editorial" id="shop"><div class="section-heading"><p class="eyebrow">COUNTY STORE · 2026/27</p><h2>把蓝白穿在身上</h2><p>本赛季三款球衣。库存与购买服务由官方商店提供。</p></div><div class="kit-grid">${fanContent.kits.map(k=>`<a class="kit-item" href="${k.url}" target="_blank" rel="noreferrer"><img src="${k.image}" alt="${k.title}" width="600" height="600" loading="lazy"><h3>${k.title}</h3><span>前往官方商店 ↗</span></a>`).join('')}</div></section>`);
await writeFile(homepageUrl,homepage);
await mkdir(new URL('../history/',import.meta.url),{recursive:true});
await writeFile(new URL('../history/index.html',import.meta.url),documentShell({title:'球队历史',description:'从1883年到今天，斯托克波特郡的蓝白故事。',sectionLabel:'球队历史',body:`<section class="section browse-hero"><p class="eyebrow">SINCE 1883</p><h1>一座城，我们的帽匠。</h1><p>从希顿诺里斯到埃奇利公园，从低谷到一次次重返联赛。</p></section><section class="section"><div class="history-tabs" aria-label="历史年代">${['','起点','主场','复兴','当下'].map((era,i)=>`<button type="button" class="quiet-button" data-history-filter="${era}" aria-pressed="${i===0}">${era||'全部年代'}</button>`).join('')}</div><div class="history-story-list">${clubHistory.map((h,i)=>`<section data-history-era="${h.era}" class="history-story"><img src="${pageImage(h.image)}" alt="${h.title}" loading="lazy"><div><p class="eyebrow">${h.era} · ${h.year}</p><h2>${h.title}</h2><details ${i===0?'open':''}><summary>展开故事</summary><p>${h.text}</p>${h.person?`<a class="text-link" href="../squad/${h.person}.html">认识相关人物 →</a>`:''}</details></div></section>`).join('')}</div><p class="source-note">依据俱乐部历史及人物资料整理。生涯统计对应原赛季记录。<a href="https://www.stockportcounty.com/" target="_blank" rel="noreferrer">俱乐部官网 ↗</a></p></section>`,backHref:'../index.html',backText:'返回首页'}));
