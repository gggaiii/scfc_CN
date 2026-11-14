export const escapeHtml = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
export const slugify = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const personSlug = p => p.slug || slugify(p.name);
export const roleLine = p => [p.number ? `${p.number}号` : '',p.leadership !== p.role ? p.leadership : '',p.role].filter(Boolean).join(' · ');
export const groups = [['coaches','教练团队'],['goalkeepers','守门员'],['defenders','后场球员'],['midfielders','中场球员'],['forwards','前场球员']];
export const dateLabel = iso => !iso || Number.isNaN(Date.parse(iso)) ? '时间待定' : new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso));
export function getSaved(){try{const saved=JSON.parse(localStorage.getItem('county-saved') || '[]');return Array.isArray(saved)?saved:[];}catch{return [];}}
export function saveToggle(id){const saved=new Set(getSaved());saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('county-saved',JSON.stringify([...saved]));return saved.has(id);}catch{return null;}}
export function setQuery(values){const u=new URL(location.href);for(const [k,v]of Object.entries(values))v?u.searchParams.set(k,v):u.searchParams.delete(k);history.replaceState(null,'',u);}
export function bookmark(id,label){return `<button class="bookmark" type="button" data-save="${escapeHtml(id)}" aria-pressed="false" title="收藏${escapeHtml(label)}" aria-label="收藏${escapeHtml(label)}">☆</button>`;}
