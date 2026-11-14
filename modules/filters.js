import {escapeHtml as e,getSaved,setQuery} from './core.js';
import {squadMarkup,newsCard} from './cards.js';
export function initFilters({players,articles,paths}){
 const squad=document.querySelector('[data-squad-full]'),news=document.querySelector('[data-news-list]');
 const box=squad || news;if(!box)return;
 const isSquad=!!squad,q=new URLSearchParams(location.search);
 const form=document.createElement('form');form.className='browse-controls';form.setAttribute('role','search');
 const categories=isSquad?[['','全部位置'],['coaches','教练团队'],['goalkeepers','守门员'],['defenders','后场'],['midfielders','中场'],['forwards','前场']]:[['','全部分类'],...[...new Set(articles.map(a=>a.category))].map(v=>[v,v])];
 form.innerHTML=`<label class="search-field"><span>搜索</span><input name="q" type="search" placeholder="${isSquad?'姓名或号码':'新闻关键词'}" value="${e(q.get('q') || '')}"></label><label>分类<select name="category">${categories.map(([value,label])=>`<option value="${e(value)}" ${q.get('category')===value?'selected':''}>${label}</option>`).join('')}</select></label>${isSquad?`<label>球员状态<select name="status"><option value="">全部</option><option value="active">在队</option><option value="loan">外租</option></select></label>`:''}<label class="check-label"><input name="saved" type="checkbox" ${q.get('saved')==='1'?'checked':''}>已收藏</label><button type="reset" class="quiet-button">重置</button><output aria-live="polite"></output>`;
 box.before(form);if(isSquad)form.elements.status.value=q.get('status') || '';
 let limit=6;
 const more=document.createElement('button');more.className='load-more';more.textContent='加载更多';more.type='button';if(news)box.after(more);
 function render(){const term=form.elements.q.value.trim().toLowerCase(),category=form.elements.category.value,saved=form.elements.saved.checked,status=isSquad?form.elements.status.value:'';
 setQuery({q:term,category,status,saved:saved?'1':''});
 const items=(isSquad?players:articles).filter(item=>{const id=isSquad?`player:${item.slug}`:`news:${item.slug}`;return(!category||(isSquad?item.group:item.category)===category)&&(!saved||getSaved().includes(id))&&(!status||(status==='loan'?item.squadStatus==='外租':item.squadStatus!=='外租'))&&(!term||[item.name,item.zhName,item.number,item.title,item.summary].filter(Boolean).join(' ').toLowerCase().includes(term));});
 form.querySelector('output').textContent=`${items.length} ${isSquad?'位成员':'篇报道'}`;
 box.innerHTML=isSquad?squadMarkup(items,paths):items.slice(0,limit).map(a=>newsCard(a,paths)).join('') || '<p class="empty-state">没有找到相关报道。</p>';
 more.hidden=isSquad||items.length<=limit;document.dispatchEvent(new Event('county:render'));
 }
 form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('input',()=>{limit=6;render();});form.addEventListener('reset',event=>{event.preventDefault();form.elements.q.value='';form.elements.category.value='';form.elements.saved.checked=false;if(isSquad)form.elements.status.value='';limit=6;render();});more.addEventListener('click',()=>{limit+=6;render();});document.addEventListener('county:saved',()=>{if(form.elements.saved.checked)render();});window.addEventListener('popstate',()=>location.reload());render();
}
