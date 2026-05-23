const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const fixturesContainer = document.querySelector("[data-fixtures]");
const squadContainer = document.querySelector("[data-squad]");
const fullSquadContainer = document.querySelector("[data-squad-full]");
const homeNewsContainer = document.querySelector("[data-home-news]");
const newsListContainer = document.querySelector("[data-news-list]");
const newsArticleContainer = document.querySelector("[data-news-article]");
const playerProfileContainer = document.querySelector("[data-player-profile]");

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

const newsArticles = [
  {
    slug: "season-preview",
    pinned: true,
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

const squadPlayers = [
  { name: "Dave Challinor", group: "coaches", role: "主教练", leadership: "主教练", image: "assets/squad/coaches/Challinor-01.jpg", intro: "球队长期建设的核心人物，负责一线队战术、训练与比赛管理。" },
  { name: "Clint Hill", group: "coaches", role: "助理教练", image: "assets/squad/coaches/Hill-01.jpg", intro: "一线队教练组成员，协助训练组织、防守细节和比赛准备。" },
  { name: "Austin", group: "coaches", role: "一线队教练", image: "assets/squad/coaches/Austin-01.jpg", intro: "一线队训练团队成员，参与日常训练、球员沟通和比赛日准备。" },
  { name: "Nick Colgan", group: "coaches", role: "门将教练", image: "assets/squad/coaches/Colgan-01.jpg", intro: "负责门将组训练，重点关注扑救技术、出球选择和比赛阅读。" },
  { name: "Conlon", group: "coaches", role: "教练组成员", image: "assets/squad/coaches/Conlon-01.jpg", intro: "教练团队成员，协助一线队训练安排和球员发展。" },
  { name: "Jordan Hargan", group: "coaches", role: "体能与表现团队", image: "assets/squad/coaches/Hargan-01.jpg", intro: "参与球员身体状态、训练负荷和比赛恢复相关工作。" },
  { name: "James Holloway", group: "coaches", role: "分析团队", image: "assets/squad/coaches/Holloway-01.jpg", intro: "通过视频和数据分析支持教练组备战、复盘和对手研究。" },
  { name: "Sam Holt", group: "coaches", role: "医疗与康复团队", image: "assets/squad/coaches/Holt-01.jpg", intro: "参与球员健康管理、伤病恢复和训练回归流程。" },
  { name: "Jesper Jansen", group: "coaches", role: "表现团队", image: "assets/squad/coaches/Jansen-01.jpg", intro: "一线队幕后团队成员，支持训练质量、球员状态和日常准备。" },
  { name: "Rene Meulensteen", group: "coaches", role: "技术顾问", image: "assets/squad/coaches/Meulensteen-01.jpg", intro: "为球队技术训练和比赛细节提供经验支持。" },
  { name: "Neil Phillips", group: "coaches", role: "医疗团队", image: "assets/squad/coaches/Phillips-01.jpg", intro: "负责球员医疗保障和比赛日健康支持。" },
  { name: "Matt Smith", group: "coaches", role: "教练组成员", image: "assets/squad/coaches/Smith-01.jpg", intro: "协助一线队训练执行、球员管理和比赛准备。" },
  { name: "Ryan Sweeney", group: "coaches", role: "分析与技术团队", image: "assets/squad/coaches/Sweeney-01.jpg", intro: "为教练组提供比赛分析、训练反馈和资料整理支持。" },
  { name: "Ben Hinchliffe", number: "1", group: "goalkeepers", role: "门将", leadership: "副队长", image: "assets/squad/Hinchliffe-01.jpg", intro: "经验丰富的门线守护者，是球队后场稳定性的重要来源。" },
  { name: "Max Metcalfe", number: "25", group: "goalkeepers", role: "门将", image: "assets/squad/Metcalfe-01.jpg", intro: "年轻门将储备，适合在杯赛和训练体系中继续积累经验。" },
  { name: "Corey Addai", number: "34", group: "goalkeepers", role: "门将", image: "assets/squad/Addai-01.jpg", intro: "具备身体条件和反应速度的门将，为门将位置提供竞争深度。" },
  { name: "Andrew Wogan", group: "goalkeepers", role: "门将", squadStatus: "外租", image: "assets/squad/Wogan-01.jpg", intro: "门将组成员，目前以外租形式积累一线队比赛经验。" },
  { name: "Josh Dacres-Cogley", number: "2", group: "defenders", role: "后卫", image: "assets/squad/DacresCogley-01.jpg", intro: "边路防守球员，能够提供推进、压迫和宽度。" },
  { name: "Owen Dodgson", number: "3", group: "defenders", role: "后卫", image: "assets/squad/Dodgson-01.jpg", intro: "边后卫选择之一，适合在宽区域提供跑动和防守覆盖。" },
  { name: "Joseph Olowu", number: "5", group: "defenders", role: "后卫", image: "assets/squad/Olowu-01.jpg", intro: "后防轮换力量，适合需要速度和身体对抗的比赛场景。" },
  { name: "Arttu Hoskonen", number: "6", group: "defenders", role: "后卫", image: "assets/squad/Hoskonen-01.jpg", intro: "防线中路选择，提供身高、对抗和定位球保护。" },
  { name: "Roman Dixon", number: "12", group: "defenders", role: "后卫", image: "assets/squad/Dixon-01.jpg", intro: "年轻后场球员，能够为防线提供速度、对抗和阵容深度。" },
  { name: "Tayo Edun", number: "14", group: "defenders", role: "后卫/中场", image: "assets/squad/Edun-01.jpg", intro: "可覆盖边后卫和中场区域，增加阵容的灵活性。" },
  { name: "Ethan Pye", number: "15", group: "defenders", role: "后卫", image: "assets/squad/Pye-01.jpg", intro: "左脚中卫/后场球员，能参与出球并提升防线覆盖范围。" },
  { name: "Callum Connolly", number: "16", group: "defenders", role: "后卫/中场", image: "assets/squad/Connolly-01.jpg", intro: "多面手球员，可根据比赛需要在中后场切换位置。" },
  { name: "Brad Hills", number: "33", group: "defenders", role: "后卫", image: "assets/squad/Hills-01.jpg", intro: "中后卫选择之一，特点是对抗、落位和禁区防守。" },
  { name: "Christy Grogan", number: "45", group: "defenders", role: "后卫", image: "assets/squad/Grogan-01.jpg", intro: "防线年轻轮换选择，注重对抗、站位和禁区保护。" },
  { name: "Jade Jay Mingi", group: "defenders", role: "后卫/中场", squadStatus: "外租", image: "assets/squad/Mingi-01.jpg", intro: "能胜任后场和中场位置，目前以外租形式积累比赛时间。" },
  { name: "Lewis Bate", number: "4", group: "midfielders", role: "中场", leadership: "队长", image: "assets/squad/Bate-01.jpg", intro: "技术型中场，擅长在中路接应、转移和向前输送，是球队中场节奏的重要连接点。" },
  { name: "Jack Diamond", number: "7", group: "midfielders", role: "中场/边路", image: "assets/squad/Diamond-01.jpg", intro: "边路进攻球员，特点是速度、突破和向禁区输送。" },
  { name: "Callum Camps", number: "8", group: "midfielders", role: "中场", image: "assets/squad/Camps-01.jpg", intro: "攻守均衡的中场球员，能插上进攻也能参与压迫。" },
  { name: "Owen Moxon", group: "midfielders", role: "中场", squadStatus: "外租", image: "assets/squad/Moxon-01.jpg", intro: "中场组织与推进选择，目前以外租形式获得更多比赛机会。" },
  { name: "Lewis Fiorini", number: "18", group: "midfielders", role: "中场", image: "assets/squad/Fiorini-01.jpg", intro: "具备创造力的中场球员，可在前场三区参与进攻串联。" },
  { name: "Ben Osborn", number: "23", group: "midfielders", role: "中场", image: "assets/squad/Osbourne-01.jpg", intro: "经验丰富的中场球员，能为球队提供跑动、控球和比赛阅读。" },
  { name: "Tyler Onyango", number: "24", group: "midfielders", role: "中场", squadStatus: "租借", image: "assets/squad/Onyango-01.jpg", intro: "身体条件出色的中场球员，能在攻守转换中提供覆盖。" },
  { name: "Oliver Norwood", number: "26", group: "midfielders", role: "中场", leadership: "副队长", image: "assets/squad/Norwood-01.jpg", intro: "经验丰富的中场指挥者，长传、定位球和比赛阅读能力突出。" },
  { name: "Odin Bailey", number: "27", group: "midfielders", role: "中场", image: "assets/squad/Bailey-01.jpg", intro: "可在边路或中前场活动，为球队提供盘带和创造力。" },
  { name: "Josh Stokes", number: "28", group: "midfielders", role: "中场/前场", image: "assets/squad/Stokes-01.jpg", intro: "前场与中场之间的连接球员，具备创造机会和冲击防线的能力。" },
  { name: "Corey Edwards", number: "42", group: "midfielders", role: "中场", image: "assets/squad/Edwards-01.jpg", intro: "年轻中场球员，能够继续通过一线队训练和比赛机会积累经验。" },
  { name: "Che Gardner", number: "48", group: "midfielders", role: "中场", image: "assets/squad/Gardner-01.jpg", intro: "中场年轻球员，为球队提供跑动和阵容深度。" },
  { name: "Tanto Olaofe", number: "9", group: "forwards", role: "前锋", squadStatus: "租借", image: "assets/squad/Olaofe-01.jpg", intro: "速度型前锋，擅长冲击身后空间并制造门前机会。" },
  { name: "Malik Mothersille", number: "11", group: "forwards", role: "前锋", image: "assets/squad/Mothersille-01.jpg", intro: "前场攻击手，能够冲击防线并在禁区附近制造威胁。" },
  { name: "Kyle Wootton", number: "19", group: "forwards", role: "前锋", image: "assets/squad/Wootton-01.jpg", intro: "高中锋类型，能背身拿球、争顶并作为前场支点。" },
  { name: "Louie Barry", number: "20", group: "forwards", role: "前锋/边锋", squadStatus: "租借", image: "assets/squad/Barry-01.jpg", intro: "前场攻击球员，能够在边路和中路之间切换，提供突破和终结。" },
  { name: "Benoný Breki Andrésson", number: "22", group: "forwards", role: "前锋", image: "assets/squad/Andresson-01.jpg", intro: "锋线选择之一，为球队提供中路终结和前场压迫。" },
  { name: "Adama Sidibeh", number: "29", group: "forwards", role: "前锋", image: "assets/squad/Sidibeh-01.jpg", intro: "锋线冲击型球员，能够在禁区附近制造压力。" },
  { name: "Jayden Fevrier", group: "forwards", role: "边锋", squadStatus: "外租", image: "assets/squad/Fevrier-01.jpg", intro: "年轻边路攻击手，目前以外租形式积累比赛经验。" },
  { name: "Jid Okeke", group: "forwards", role: "前锋", squadStatus: "外租", image: "assets/squad/Okeke-01.jpg", intro: "锋线年轻力量，目前以外租形式争取更多一线队出场时间。" },
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getParam = (name) => new URLSearchParams(window.location.search).get(name);

const getPlayerRoleLine = (player) => {
  const role = player.leadership ? `${player.leadership} · ${player.role}` : player.role;
  return player.number ? `${player.number}号 · ${role}` : role;
};

const renderSquadStatusBadge = (player) =>
  player.squadStatus ? `<span class="squad-status">${escapeHtml(player.squadStatus)}</span>` : "";

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
          <p>${escapeHtml(player.intro)}</p>
          <a class="card-link" href="${escapeHtml(pagePath(`squad/player.html?player=${slugify(player.name)}`))}">查看资料</a>
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
            <a class="mini-player-card" href="${escapeHtml(`player.html?player=${slugify(player.name)}`)}">
              <img src="${escapeHtml(assetPath(player.image))}" alt="${escapeHtml(player.name)}" />
              ${renderSquadStatusBadge(player)}
              <span>${escapeHtml(role)}</span>
              <strong>${escapeHtml(player.name)}</strong>
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
    <a href="${escapeHtml(pagePath(`news/article.html?slug=${article.slug}`))}">阅读全文</a>
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
            <a href="${escapeHtml(`article.html?slug=${article.slug}`)}">阅读全文</a>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderNewsArticle = () => {
  if (!newsArticleContainer) return;

  const article = newsArticles.find((item) => item.slug === getParam("slug")) ?? newsArticles.find((item) => item.pinned) ?? newsArticles[0];
  newsArticleContainer.innerHTML = `
    <article class="detail-article">
      <img src="${escapeHtml(assetPath(article.image))}" alt="${escapeHtml(article.title)}" />
      <p class="tag">${escapeHtml(article.category)} · ${escapeHtml(article.date)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      ${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <a class="button primary" href="index.html">返回新闻列表</a>
    </article>
  `;
};

const renderPlayerProfile = () => {
  if (!playerProfileContainer) return;

  const player = squadPlayers.find((item) => slugify(item.name) === getParam("player")) ?? squadPlayers[0];
  const image = assetPath(player.image || playerImages[squadPlayers.indexOf(player) % playerImages.length]);
  const role = getPlayerRoleLine(player);

  playerProfileContainer.innerHTML = `
    <article class="player-profile-card">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(player.name)}" />
      <div>
        ${renderSquadStatusBadge(player)}
        <p class="tag">${escapeHtml(role)}</p>
        <h1>${escapeHtml(player.name)}</h1>
        ${player.number ? `<p class="player-number">球衣号码：${escapeHtml(player.number)}号</p>` : ""}
        <p>${escapeHtml(player.intro)}</p>
        <a class="button primary" href="index.html">返回阵容</a>
      </div>
    </article>
  `;
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
renderNewsArticle();
renderPlayerProfile();
loadClubData();
