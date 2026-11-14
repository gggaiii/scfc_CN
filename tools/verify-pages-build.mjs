import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)(process.argv[2]);
const root=resolve('dist'),prefix='/stockportcounty-china/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(request,response)=>{
 try{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(!pathname.startsWith(prefix)){response.writeHead(404).end();return;}
  let path=resolve(root,pathname.slice(prefix.length));
  if(path!==root&&!path.startsWith(root+sep)){response.writeHead(403).end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  response.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(await readFile(path));
 }catch{response.writeHead(404).end();}
});
await new Promise(ready=>server.listen(0,'127.0.0.1',ready));
const base=`http://127.0.0.1:${server.address().port}${prefix}`;
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();const errors=[],missing=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)missing.push(response.url());});
await page.route('**/v2/opta/getupcoming?**',route=>route.fulfill({status:503}));
try{
 for(const path of ['','squad/index.html','squad/oliver-norwood.html','news/index.html','news/match-preview--county-v-reading.html','history/index.html']){
  await page.goto(base+path);
  await page.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(img=>img.decode()));});
  assert.ok(await page.locator('h1').count()>0,path);
 }
 await page.goto(base+'squad/index.html');await page.getByRole('searchbox').fill('诺伍德');
 assert.equal(await page.locator('.mini-player-card').count(),1);
 await page.locator('.portrait-link').click();assert.ok(page.url().startsWith(base+'squad/'));
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 console.log(JSON.stringify({prefix,pages:6,search:'passed',navigation:'passed',errors,missing}));
}finally{await browser.close();await new Promise(done=>server.close(done));}
