import { mkdir, writeFile } from "node:fs/promises";
import { newsArticles } from "../data/news.js";
import { squadPlayers } from "../data/squad.js";

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
  const role = player.leadership ? `${player.leadership} · ${player.role}` : player.role;
  return player.number ? `${player.number}号 · ${role}` : role;
};

const statusBadge = (player) => (player.squadStatus ? `<span class="squad-status">${escapeHtml(player.squadStatus)}</span>` : "");

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
      <nav class="main-nav" data-nav>
        <a href="../index.html">首页</a>
        <a href="../news/index.html">新闻</a>
        <a href="../squad/index.html">阵容</a>
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
  const body = `      <section class="section detail-section">
        <article class="detail-article">
          <img src="${escapeHtml(pageImage(article.image))}" alt="${escapeHtml(article.title)}" />
          <p class="tag">${escapeHtml(article.category)} · ${escapeHtml(article.date)}</p>
          <h1>${escapeHtml(article.title)}</h1>
          ${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
          ${article.sourceUrl ? `<a class="button primary" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">查看官方原文</a>` : ""}
          <a class="button secondary" href="index.html">返回新闻列表</a>
        </article>
      </section>`;

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
  const slug = slugify(player.name);
  const body = `      <section class="section detail-section">
        <article class="player-profile-card">
          <img src="${escapeHtml(pageImage(player.image))}" alt="${escapeHtml(player.name)}" />
          <div>
            ${statusBadge(player)}
            <p class="tag">${escapeHtml(roleLine(player))}</p>
            <h1>${escapeHtml(player.name)}</h1>
            ${player.number ? `<p class="player-number">球衣号码：${escapeHtml(player.number)}号</p>` : ""}
${playerDetailMarkup(player)}
            <a class="button primary" href="index.html">返回阵容</a>
          </div>
        </article>
      </section>`;

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
