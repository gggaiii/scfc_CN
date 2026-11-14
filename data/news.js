import officialMedia from "./official-media.json" with { type: "json" };
import fanContent from './fan-content.json' with {type:'json'};
const legacyArticles = [
  {
    slug: "reading-officials-november-2026", pinned: true, date: "2026-11-12", category: "赛前消息",
    title: "主场迎战雷丁：裁判安排公布",
    summary: "11月14日主场对雷丁，博比·马德利担任主裁判。",
    image: "assets/edgeley-park-aerial.jpg",
    sourceUrl: "https://www.stockportcounty.com/news/2026/november/12/match-officials---reading--h-/",
    body: ["俱乐部确认，主场对雷丁的英甲比赛将由博比·马德利执法。", "理查德·伍德沃德和马修·索尔比担任助理裁判，利·道蒂担任第四官员。本文为官方公告的中文摘要。"],
  },
  {
    slug: "fa-cup-reading-draw-2026", pinned: false, date: "2026-11-09", category: "足总杯",
    title: "足总杯第二轮：客场对阵雷丁",
    summary: "帽匠将在12月5日所在周末客场挑战雷丁，详细安排以官方公告为准。",
    image: "assets/county-playoffs-team.jpg",
    sourceUrl: "https://www.stockportcounty.com/news/2026/november/09/county-discover-fa-cup-second-round-opponents/",
    body: ["帽匠在足总杯第二轮抽中雷丁，比赛将在客场进行。", "吉米·麦克纳尔蒂的球队此前在少一人、两球落后的情况下，经加时赛3比2逆转克雷流浪者。本文为官方报道的中文摘要。"],
  },
  {
    slug: "bolton-wanderers-v-county-preview",
    pinned: false,
    date: "2026-05-23",
    category: "赛前前瞻",
    title: "赛前前瞻：博尔顿流浪者 vs 斯托克波特郡",
    summary: "County 将在温布利迎来与博尔顿流浪者的关键战役，目标是在赛季收官阶段把握升级机会。",
    image: "assets/county-playoffs-team.jpg",
    sourceUrl: "https://www.stockportcounty.com/news/2026/may/23/match-preview--bolton-wanderers-v-county-/",
    body: [
      "斯托克波特郡将在温布利对阵博尔顿流浪者，这场比赛是赛季末最重要的舞台之一。对中文球迷来说，关注点很直接：County 需要在中立场地承受压力、控制节奏，并把握关键机会。",
      "博尔顿流浪者是英格兰低级别联赛中经验丰富、身体对抗强度很高的对手。County 需要在中场争夺、定位球防守和转换进攻中保持专注，尤其要避免让比赛过早进入对手擅长的节奏。",
      "比赛地点为温布利球场，北京时间为 5月24日周日 20:00。本站会继续以中文整理赛前、赛后和阵容相关信息；完整英文赛前报道请以俱乐部官方网站为准。",
    ],
  },
  {
    slug: "season-preview",
    pinned: false,
    date: "2026-05-23",
    category: "官方新闻",
    title: "中文页保留摘要，详细内容跳转官方英文站",
    summary: "适合把赛前发布会、转会公告、伤病更新和社区活动整理成中文导读。",
    image: "assets/county-playoffs-trophy.jpg",
    body: [
      "中文球迷主页会把重要官方信息整理成更容易阅读的中文摘要，包括赛前发布会、转会公告、伤病更新和俱乐部正式声明。",
      "详细报道、票务安排和正式服务仍以俱乐部英文官方网站为准。中文页的定位是帮助球迷快速抓住重点，再跳转到官方来源。",
    ],
  },
  {
    slug: "squad-watch",
    pinned: false,
    date: "2026-05-22",
    category: "球队观察",
    title: "阵容变化与关键球员",
    summary: "结合站内中文阵容资料，后续可以为每名球员增加头像、号码和赛季表现。",
    image: "assets/county-playoffs-team.jpg",
    body: [
      "球队观察栏目会关注首发变化、队长组职责、关键球员状态和比赛中的战术重点。",
      "随着阵容页继续完善，每名球员都可以拥有独立资料页，方便中文球迷长期跟踪球员表现。",
    ],
  },
  {
    slug: "edgeley-park-culture",
    pinned: false,
    date: "2026-05-21",
    category: "社区",
    title: "埃奇利公园与本地文化",
    summary: "用中文介绍主场、球迷传统和 Stockport 这座城市，让新球迷知道为什么支持 County。",
    image: "assets/edgeley-park-aerial.jpg",
    body: [
      "埃奇利公园不只是比赛场地，也是斯托克波特郡球迷身份的一部分。球场、街区和看台文化共同构成了 County 的日常。",
      "这个栏目会继续补充主场历史、比赛日动线、球迷歌曲和城市背景。",
    ],
  },
];

export const newsArticles = [...fanContent.news, ...legacyArticles.filter(a=>a.slug==='bolton-wanderers-v-county-preview')];
for (const article of newsArticles) {
  const media = officialMedia.news.find(item => item.slug === article.slug);
  if (media) article.image = media.image;
}
