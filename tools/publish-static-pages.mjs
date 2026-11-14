import {execFileSync,spawnSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const safeDirectory=process.cwd().replaceAll('\\','/');
const git=(args,options={})=>execFileSync('git',['-c',`safe.directory=${safeDirectory}`,...args],{maxBuffer:64*1024*1024,...options});
const hash=content=>createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
const files=[];
async function collect(folder,prefix=''){
 for(const item of await readdir(folder,{withFileTypes:true})){
  assert.ok(!item.isSymbolicLink(),'Publishing symbolic links is not supported');
  const path=prefix+item.name;
  if(item.isDirectory())await collect(join(folder,item.name),path+'/');
  else{const content=await readFile(join(folder,item.name));files.push({path,content,sha:hash(content)});}
 }
}
await collect('dist');
if(!files.some(file=>file.path==='.nojekyll'))files.push({path:'.nojekyll',content:Buffer.alloc(0),sha:hash(Buffer.alloc(0))});
assert.ok(files.some(file=>file.path==='index.html'),'Build the website before publishing');
if(process.argv.includes('--dry-run')){
 console.log(JSON.stringify({files:files.length,bytes:files.reduce((sum,file)=>sum+file.content.length,0),destination:'gh-pages',dryRun:true}));
 process.exit(0);
}
assert.equal(git(['status','--porcelain']).toString().trim(),'','Commit and push the source changes before publishing');
const remote=new URL(git(['remote','get-url','origin']).toString().trim());
assert.equal(remote.hostname,'github.com','Only the origin GitHub repository is supported');
const repo=remote.pathname.replace(/^\//,'').replace(/\.git$/,'');
assert.match(repo,/^[\w.-]+\/[\w.-]+$/);
const credentials=spawnSync('git',['-c',`safe.directory=${safeDirectory}`,'-c','credential.interactive=false','credential','fill'],{input:`protocol=https\nhost=github.com\npath=${repo}.git\n\n`,encoding:'utf8',env:{...process.env,GCM_INTERACTIVE:'Never',GIT_TERMINAL_PROMPT:'0'},timeout:15000});
const password=credentials.stdout?.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
assert.ok(password,'Sign in to GitHub using Git Credential Manager first');
async function api(path,method='GET',body){
 const response=await fetch(`https://api.github.com/repos/${repo}${path}`,{method,headers:{Authorization:`Bearer ${password}`,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'county-static-publisher'},body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(60000)});
 const result=response.status===204?{}:await response.json();
 if(!response.ok)throw new Error(`${method} ${path}: ${response.status} ${result.message}`);
 return result;
}
const head=git(['rev-parse','HEAD']).toString().trim();
const sourceBranch=git(['branch','--show-current']).toString().trim();
assert.equal(sourceBranch,'master','Publish from the master source branch');
assert.equal((await api('/git/ref/heads/master')).object.sha,head,'Push the source commit before publishing');
const pages=await api('/pages');
assert.equal(pages.build_type,'legacy','Select branch publishing in GitHub Pages before using this command');
assert.equal(pages.source.branch,'gh-pages','This command only updates the gh-pages publishing branch');
const previous=(await api('/git/ref/heads/gh-pages')).object.sha;
const previousCommit=await api(`/git/commits/${previous}`);
const known=new Set(git(['rev-list','--objects','--all']).toString().split('\n').map(line=>line.split(' ')[0]));
const entries=[];
for(const file of files){
 if(known.has(file.sha)){entries.push({path:file.path,mode:'100644',type:'blob',sha:file.sha});continue;}
 let text;try{if(!file.content.includes(0))text=new TextDecoder('utf-8',{fatal:true}).decode(file.content);}catch{}
 if(text!==undefined)entries.push({path:file.path,mode:'100644',type:'blob',content:text});
 else{
  const blob=await api('/git/blobs','POST',{encoding:'base64',content:file.content.toString('base64')});assert.equal(blob.sha,file.sha);
  entries.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});
  await new Promise(done=>setTimeout(done,1000));
 }
}
const tree=await api('/git/trees','POST',{tree:entries});
const uploaded=await api(`/git/trees/${tree.sha}?recursive=1`);
assert.ok(!uploaded.truncated,'Remote tree verification was truncated');
const blobs=uploaded.tree.filter(item=>item.type==='blob');
assert.equal(blobs.length,files.length);
for(const file of files)assert.equal(blobs.find(item=>item.path===file.path)?.sha,file.sha,`Upload mismatch: ${file.path}`);
if(tree.sha===previousCommit.tree.sha){console.log(JSON.stringify({unchanged:true,url:pages.html_url,files:files.length}));process.exit(0);}
const commit=await api('/git/commits','POST',{tree:tree.sha,parents:[previous],message:`Publish website from source ${head.slice(0,7)}`});
await api('/git/refs/heads/gh-pages','PATCH',{sha:commit.sha,force:false});
await api('/pages/builds','POST');
console.log(JSON.stringify({submitted:true,url:pages.html_url,files:files.length,commit:commit.sha,treeVerified:true}));
