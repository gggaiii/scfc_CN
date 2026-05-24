import { newsArticles } from "./data/news.js";
import { squadPlayers } from "./data/squad.js";

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const fixturesContainer = document.querySelector("[data-fixtures]");
const squadContainer = document.querySelector("[data-squad]");
const fullSquadContainer = document.querySelector("[data-squad-full]");
const homeNewsContainer = document.querySelector("[data-home-news]");
const newsListContainer = document.querySelector("[data-news-list]");

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const TEAM_ID = "134258";
const TEAM_MATCHERS = ["stockport county", "stockport", "斯托克波特"];
const bundledAssets =
  typeof import.meta.glob === "function"
    ? import.meta.glob("./assets/**/*", {
        eager: true,
        import: "default",
        query: "?url",
      })
    : {};
const assetPrefix = document.querySelector('script[src^="../"]') ? "../" : "";
const assetPath = (path) => {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith("/") || path.startsWith("../")) return path;
  const bundledPath = bundledAssets[`./${path}`];
  if (bundledPath) return bundledPath;
  return `${assetPrefix}${path}`;
};
const pagePath = (path) => `${assetPrefix}${path}`;
const stockportBadge = assetPath("assets/stockport-county-fc-logo.png");

const teamBadgeMap = new Map([
  ["bolton wanderers", "https://upload.wikimedia.org/wikipedia/en/8/82/Bolton_Wanderers_FC_logo.svg"],
  ["博尔顿流浪者", "https://upload.wikimedia.org/wikipedia/en/8/82/Bolton_Wanderers_FC_logo.svg"],
]);

const fallbackFixtures = [
  {
    strEvent: "Stockport County vs Bolton Wanderers",
    strHomeTeam: "斯托克波特郡",
    strAwayTeam: "Bolton Wanderers",
    strLeague: "English League 1",
    dateEvent: "2026-05-24",
    strTime: "12:00:00",
    strVenue: "Wembley Stadium",
    strAwayTeamBadge: "https://upload.wikimedia.org/wikipedia/en/8/82/Bolton_Wanderers_FC_logo.svg",
    sourceNote: "备用赛程：接口暂时不可用时显示",
  },
];

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open") ?? false;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "打开导航");
  }
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getPlayerRoleLine = (player) => {
  const role = player.leadership ? `${player.leadership} · ${player.role}` : player.role;
  return player.number ? `${player.number}号 · ${role}` : role;
};

const renderSquadStatusBadge = (player) =>
  player.squadStatus ? `<span class="squad-status">${escapeHtml(player.squadStatus)}</span>` : "";

const getPlayerShortIntro = (player) => player.shortIntro || player.intro || "";
const getPlayerDetail = (player) => player.detail || player.intro || "";

const formatMatchDate = (date, time) => {
  if (!date) return "时间待定";
  const normalizedTime = time && time !== "00:00:00" ? time : "12:00:00";
  const matchDate = new Date(`${date}T${normalizedTime}Z`);

  if (Number.isNaN(matchDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: time && time !== "00:00:00" ? "2-digit" : undefined,
    minute: time && time !== "00:00:00" ? "2-digit" : undefined,
    timeZone: "Asia/Shanghai",
  }).format(matchDate);
};

const translationMap = new Map([
  ["premier league", "英格兰超级联赛"],
  ["english premier league", "英格兰超级联赛"],
  ["epl", "英格兰超级联赛"],
  ["championship", "英格兰冠军联赛"],
  ["english championship", "英格兰冠军联赛"],
  ["efl championship", "英格兰冠军联赛"],
  ["english league championship", "英格兰冠军联赛"],
  ["english league one", "英格兰甲级联赛"],
  ["english league 1", "英格兰甲级联赛"],
  ["league one", "英格兰甲级联赛"],
  ["league 1", "英格兰甲级联赛"],
  ["efl league one", "英格兰甲级联赛"],
  ["english league two", "英格兰乙级联赛"],
  ["english league 2", "英格兰乙级联赛"],
  ["league two", "英格兰乙级联赛"],
  ["league 2", "英格兰乙级联赛"],
  ["efl league two", "英格兰乙级联赛"],
  ["national league", "英格兰全国联赛"],
  ["fa cup", "英格兰足总杯"],
  ["the fa cup", "英格兰足总杯"],
  ["efl cup", "英格兰联赛杯"],
  ["carabao cup", "英格兰联赛杯"],
  ["league cup", "英格兰联赛杯"],
  ["efl trophy", "英格兰锦标赛"],
  ["bristol street motors trophy", "英格兰锦标赛"],
  ["community shield", "英格兰社区盾"],
  ["fa community shield", "英格兰社区盾"],
  ["fa trophy", "英格兰足总锦标"],
  ["fa vase", "英格兰足总瓶"],
  ["uefa champions league", "欧洲冠军联赛"],
  ["champions league", "欧洲冠军联赛"],
  ["uefa europa league", "欧足联欧洲联赛"],
  ["europa league", "欧足联欧洲联赛"],
  ["uefa conference league", "欧足联协会联赛"],
  ["conference league", "欧足联协会联赛"],
  ["accrington stanley", "阿克灵顿斯坦利"],
  ["arsenal", "阿森纳"],
  ["aston villa", "阿斯顿维拉"],
  ["barrow", "巴罗"],
  ["bournemouth", "伯恩茅斯"],
  ["afc bournemouth", "伯恩茅斯"],
  ["brentford", "布伦特福德"],
  ["brighton", "布莱顿"],
  ["brighton & hove albion", "布莱顿"],
  ["bristol rovers", "布里斯托尔流浪者"],
  ["bromley", "布罗姆利"],
  ["burnley", "伯恩利"],
  ["carlisle united", "卡莱尔联"],
  ["cheltenham town", "切尔滕纳姆"],
  ["chelsea", "切尔西"],
  ["colchester united", "科尔切斯特联"],
  ["crystal palace", "水晶宫"],
  ["crawley town", "克劳利镇"],
  ["everton", "埃弗顿"],
  ["fulham", "富勒姆"],
  ["leicester city", "莱斯特城"],
  ["leeds united", "利兹联"],
  ["liverpool", "利物浦"],
  ["manchester city", "曼城"],
  ["man city", "曼城"],
  ["manchester united", "曼联"],
  ["man united", "曼联"],
  ["newcastle united", "纽卡斯尔联"],
  ["nottingham forest", "诺丁汉森林"],
  ["sunderland", "桑德兰"],
  ["tottenham hotspur", "托特纳姆热刺"],
  ["tottenham", "托特纳姆热刺"],
  ["west ham united", "西汉姆联"],
  ["west ham", "西汉姆联"],
  ["wolverhampton wanderers", "狼队"],
  ["wolves", "狼队"],
  ["afc wimbledon", "AFC温布尔登"],
  ["birmingham city", "伯明翰城"],
  ["blackburn rovers", "布莱克本流浪者"],
  ["barnsley", "巴恩斯利"],
  ["blackpool", "布莱克浦"],
  ["bolton wanderers", "博尔顿流浪者"],
  ["bristol city", "布里斯托尔城"],
  ["cambridge united", "剑桥联"],
  ["charlton athletic", "查尔顿竞技"],
  ["chesterfield", "切斯特菲尔德"],
  ["crawley town", "克劳利镇"],
  ["coventry city", "考文垂"],
  ["crewe alexandra", "克鲁"],
  ["bradford city", "布拉德福德城"],
  ["burton albion", "伯顿阿尔比恩"],
  ["cardiff city", "卡迪夫城"],
  ["derby county", "德比郡"],
  ["doncaster rovers", "唐卡斯特流浪者"],
  ["exeter city", "埃克塞特城"],
  ["fleetwood town", "弗利特伍德镇"],
  ["forest green rovers", "绿色森林流浪者"],
  ["gillingham", "吉林汉姆"],
  ["grimsby town", "格林斯比镇"],
  ["harrogate town", "哈罗盖特镇"],
  ["huddersfield town", "哈德斯菲尔德"],
  ["hull city", "赫尔城"],
  ["ipswich town", "伊普斯维奇"],
  ["leyton orient", "莱顿东方"],
  ["lincoln city", "林肯城"],
  ["luton town", "卢顿"],
  ["mansfield town", "曼斯菲尔德城"],
  ["middlesbrough", "米德尔斯堡"],
  ["millwall", "米尔沃尔"],
  ["milton keynes dons", "米尔顿凯恩斯"],
  ["mk dons", "米尔顿凯恩斯"],
  ["morecambe", "莫克姆"],
  ["norwich city", "诺维奇"],
  ["northampton town", "北安普顿"],
  ["notts county", "诺茨郡"],
  ["newport county", "纽波特郡"],
  ["oldham athletic", "奥尔德姆竞技"],
  ["oxford united", "牛津联"],
  ["peterborough united", "彼得堡联"],
  ["plymouth argyle", "普利茅斯阿盖尔"],
  ["portsmouth", "朴茨茅斯"],
  ["port vale", "维尔港"],
  ["preston north end", "普雷斯顿"],
  ["queens park rangers", "女王公园巡游者"],
  ["qpr", "女王公园巡游者"],
  ["reading", "雷丁"],
  ["rotherham united", "罗瑟汉姆联"],
  ["salford city", "索尔福德城"],
  ["sheffield united", "谢菲尔德联"],
  ["sheffield wednesday", "谢菲尔德星期三"],
  ["shrewsbury town", "什鲁斯伯里镇"],
  ["southampton", "南安普顿"],
  ["southend united", "绍森德联"],
  ["stoke city", "斯托克城"],
  ["swansea city", "斯旺西"],
  ["swindon town", "斯温登镇"],
  ["stevenage", "斯蒂夫尼奇"],
  ["stockport county", "斯托克波特郡"],
  ["stockport county fc", "斯托克波特郡"],
  ["tranmere rovers", "特兰米尔流浪者"],
  ["walsall", "沃尔索尔"],
  ["watford", "沃特福德"],
  ["west bromwich albion", "西布罗姆维奇"],
  ["west brom", "西布罗姆维奇"],
  ["wigan athletic", "维冈竞技"],
  ["wrexham", "雷克瑟姆"],
  ["wycombe wanderers", "韦康比流浪者"],
  ["york city", "约克城"],
  ["emirates stadium", "酋长球场"],
  ["villa park", "维拉公园球场"],
  ["vitality stadium", "活力球场"],
  ["gtech community stadium", "Gtech社区球场"],
  ["stamford bridge", "斯坦福桥球场"],
  ["selhurst park", "塞尔赫斯特公园球场"],
  ["goodison park", "古迪逊公园球场"],
  ["hill dickinson stadium", "希尔迪金森球场"],
  ["craven cottage", "克拉文农场球场"],
  ["elland road", "埃兰路球场"],
  ["anfield", "安菲尔德球场"],
  ["etihad stadium", "伊蒂哈德球场"],
  ["old trafford", "老特拉福德球场"],
  ["st james' park", "圣詹姆斯公园球场"],
  ["st james park", "圣詹姆斯公园球场"],
  ["city ground", "城市球场"],
  ["stadium of light", "光明球场"],
  ["tottenham hotspur stadium", "托特纳姆热刺球场"],
  ["london stadium", "伦敦体育场"],
  ["molineux stadium", "莫利纽球场"],
  ["edgeley park", "埃奇利公园球场"],
  ["wembley stadium", "温布利球场"],
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const translateText = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const direct = translationMap.get(text.toLowerCase());
  if (direct) return direct;

  return [...translationMap.entries()]
    .sort((first, second) => second[0].length - first[0].length)
    .reduce((translated, [english, chinese]) => {
      const pattern = new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi");
      return translated.replace(pattern, chinese);
    }, text);
};

const getLocalTeamBadge = (teamName) => {
  const text = String(teamName ?? "").trim().toLowerCase();
  const translated = translateText(teamName);

  return teamBadgeMap.get(text) || teamBadgeMap.get(translated) || "";
};

const getFixtureTeams = (event) => {
  const homeTeam = translateText(event.strHomeTeam);
  const awayTeam = translateText(event.strAwayTeam);

  if (homeTeam || awayTeam) {
    return {
      homeTeam: homeTeam || "主队待定",
      awayTeam: awayTeam || "客队待定",
    };
  }

  const [homeFromEvent, awayFromEvent] = String(event.strEvent ?? "").split(/ vs | v /i);

  return {
    homeTeam: translateText(homeFromEvent) || "主队待定",
    awayTeam: translateText(awayFromEvent) || "客队待定",
  };
};

const getFixtureSummary = (event) => {
  const { homeTeam, awayTeam } = getFixtureTeams(event);
  const isHome = isStockportValue(event.strHomeTeam || homeTeam);
  const venue = translateText(event.strVenue) || "比赛地点待定";
  const league = translateText(event.strLeague) || "赛事待定";
  const date = formatMatchDate(event.dateEvent, event.strTime);
  const homeAwayLabel = isHome ? "主场" : "客场";
  const homeIsStockport = isStockportValue(homeTeam);
  const awayIsStockport = isStockportValue(awayTeam);
  const homeBadge = homeIsStockport ? stockportBadge : getLocalTeamBadge(homeTeam) || event.strHomeTeamBadge || "";
  const awayBadge = awayIsStockport ? stockportBadge : getLocalTeamBadge(awayTeam) || event.strAwayTeamBadge || "";

  return {
    homeTeam,
    awayTeam,
    title: `${homeTeam} vs ${awayTeam}`,
    league,
    date,
    venue,
    homeAwayLabel,
    opponent: isHome ? awayTeam : homeTeam,
    opponentBadge: isHome ? awayBadge : homeBadge,
    homeBadge: homeBadge === stockportBadge || !awayIsStockport ? homeBadge : "",
    awayBadge: awayBadge === stockportBadge || !homeIsStockport ? awayBadge : "",
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

const isStockportValue = (value) => {
  const text = String(value ?? "").toLowerCase();
  return TEAM_MATCHERS.some((matcher) => text.includes(matcher));
};

const isStockportEvent = (event) =>
  isStockportValue(event.strEvent) ||
  isStockportValue(event.strHomeTeam) ||
  isStockportValue(event.strAwayTeam);

const renderFixtures = (events, isFallback = false) => {
  if (!fixturesContainer) return;

  fixturesContainer.innerHTML = events
    .slice(0, 5)
    .map((event, index) => {
      const fixture = getFixtureSummary(event);

      return `
        <article class="fixture-card ${index === 0 ? "next" : ""}">
          <div class="fixture-opponent-badge" aria-hidden="true">
            ${
              fixture.opponentBadge
                ? `<img class="team-badge" src="${escapeHtml(fixture.opponentBadge)}" alt="" />`
                : `<span class="team-badge placeholder-badge">${escapeHtml(fixture.opponent?.slice(0, 1) || "对")}</span>`
            }
          </div>
          <div>
            <span class="${index === 0 ? "status" : ""}">${index === 0 ? "下一场" : escapeHtml(fixture.homeAwayLabel)}</span>
            <h3>${escapeHtml(fixture.title)}</h3>
            <p>${escapeHtml(fixture.league)} · 北京时间 ${escapeHtml(fixture.date)}</p>
            <p>${escapeHtml(fixture.homeAwayLabel)}对手：${escapeHtml(fixture.opponent)} · 地点：${escapeHtml(fixture.venue)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  if (isFallback) {
    fixturesContainer.insertAdjacentHTML(
      "beforeend",
      '<p class="data-note">实时接口暂时没有返回可用赛程，当前显示已整理的备用赛程。</p>',
    );
  }
};

const renderSquad = (container, players) => {
  if (!container) return;

  container.innerHTML = players
    .map((player, index) => {
      const image = assetPath(player.image || playerImages[index % playerImages.length]);
      const role = getPlayerRoleLine(player);

      return `
        <article class="player-card">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(player.name)}" />
          ${renderSquadStatusBadge(player)}
          <strong>${escapeHtml(player.name)}</strong>
          <span>${escapeHtml(role)}</span>
          <p>${escapeHtml(getPlayerShortIntro(player))}</p>
          <a class="card-link" href="${escapeHtml(pagePath(`squad/${slugify(player.name)}.html`))}">查看资料</a>
        </article>
      `;
    })
    .join("");
};

const squadGroups = [
  { key: "coaches", eyebrow: "Staff", title: "教练团队" },
  { key: "goalkeepers", eyebrow: "Goalkeepers", title: "守门员" },
  { key: "defenders", eyebrow: "Defenders", title: "后场球员" },
  { key: "midfielders", eyebrow: "Midfielders", title: "中场球员" },
  { key: "forwards", eyebrow: "Forwards", title: "前场球员" },
];

const renderGroupedSquad = (container, players) => {
  if (!container) return;

  container.innerHTML = squadGroups
    .map((group) => {
      const groupPlayers = players.filter((player) => player.group === group.key);
      if (!groupPlayers.length) return "";

      const cards = groupPlayers
        .map((player) => {
          const role = getPlayerRoleLine(player);
          return `
            <a class="mini-player-card" href="${escapeHtml(`${slugify(player.name)}.html`)}">
              <img src="${escapeHtml(assetPath(player.image))}" alt="${escapeHtml(player.name)}" />
              ${renderSquadStatusBadge(player)}
              <span>${escapeHtml(role)}</span>
              <strong>${escapeHtml(player.name)}</strong>
              <p>${escapeHtml(getPlayerShortIntro(player))}</p>
            </a>
          `;
        })
        .join("");

      return `
        <section class="squad-group">
          <div class="section-heading">
            <p class="eyebrow">${escapeHtml(group.eyebrow)}</p>
            <h2>${escapeHtml(group.title)}</h2>
          </div>
          <div class="mini-player-grid">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");
};

const renderNewsCard = (article, featured = false) => `
  <article class="${featured ? "featured-news" : ""}">
    <img src="${escapeHtml(assetPath(article.image))}" alt="${escapeHtml(article.title)}" />
    <p class="tag">${escapeHtml(article.category)}</p>
    <h3>${escapeHtml(article.title)}</h3>
    <p>${escapeHtml(article.summary)}</p>
    <a href="${escapeHtml(pagePath(`news/${article.slug}.html`))}">阅读全文</a>
  </article>
`;

const renderHomeNews = () => {
  if (!homeNewsContainer) return;

  const pinned = newsArticles.find((article) => article.pinned) ?? newsArticles[0];
  const latest = newsArticles
    .filter((article) => article.slug !== pinned.slug)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 2);

  homeNewsContainer.innerHTML = [renderNewsCard(pinned, true), ...latest.map((article) => renderNewsCard(article))].join("");
};

const renderNewsList = () => {
  if (!newsListContainer) return;

  newsListContainer.innerHTML = newsArticles
    .sort((first, second) => Number(second.pinned) - Number(first.pinned) || second.date.localeCompare(first.date))
    .map(
      (article) => `
        <article class="story-card ${article.pinned ? "featured-story" : ""}">
          <img src="${escapeHtml(assetPath(article.image))}" alt="${escapeHtml(article.title)}" />
          <div>
            <p class="tag">${escapeHtml(article.pinned ? "置顶 · " : "")}${escapeHtml(article.category)}</p>
            <h2>${escapeHtml(article.title)}</h2>
            <p>${escapeHtml(article.summary)}</p>
            <a href="${escapeHtml(`${article.slug}.html`)}">阅读全文</a>
          </div>
        </article>
      `,
    )
    .join("");
};

const loadClubData = async () => {
  try {
    const fixtureData = await fetchJson(`${API_BASE}/eventsnext.php?id=${TEAM_ID}`);
    const fixtures = fixtureData.events?.filter(isStockportEvent) ?? [];

    renderFixtures(fixtures.length ? fixtures : fallbackFixtures, !fixtures.length);
  } catch {
    renderFixtures(fallbackFixtures, true);
  }
};

const featuredPlayers = squadPlayers.filter((player) => player.leadership);

renderSquad(squadContainer, featuredPlayers);
renderGroupedSquad(fullSquadContainer, squadPlayers);
renderHomeNews();
renderNewsList();
loadClubData();
