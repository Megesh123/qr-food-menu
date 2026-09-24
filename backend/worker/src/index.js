const ALLOWED_ORIGIN = "https://menu.nexgenlink.co.in";
const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN_KEY = "github-token";
const SESSION_PREFIX = "session:";
const API_VERSION = "2026-09-24.3";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}, corsHeaders(origin))
  });
}
function text(message, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(message, {status, headers:Object.assign({"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store"},corsHeaders(origin))});
}
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("");
}
async function sameSecret(value, expectedHash) {
  return Boolean(expectedHash) && (await sha256Hex(value)) === String(expectedHash).trim().toLowerCase();
}
function githubHeaders(token) {
  return {Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};
}
async function verifyGithubToken(token, repo) {
  const headers = githubHeaders(token);
  // Validate the token against the exact file this service must publish.
  // This matches the real write path and only requires Contents read access
  // for validation; the configured PAT should additionally have Contents write.
  const url = repoUrl(repo,"menu-data.json")+"?ref=main";
  const res = await fetch(url,{headers,cache:"no-store"});
  const body = await res.json().catch(()=>({}));
  if (!res.ok) {
    const detail = body.message || "The token cannot access the repository contents.";
    const accepted = res.headers.get("X-Accepted-GitHub-Permissions") || "";
    const suffix = accepted ? " Required by GitHub: "+accepted+"." : "";
    const e = new Error("GitHub token check failed (HTTP "+res.status+"): "+detail+suffix);
    e.status = res.status;
    throw e;
  }
  return repo;
}
async function getSession(request, env, role) {
  const h=request.headers.get("Authorization")||"";
  const token=h.startsWith("Bearer ")?h.slice(7).trim():"";
  if (!token) return null;
  const raw=await env.MENU_SECRETS.get(SESSION_PREFIX+token,{cacheTtl:30});
  if (!raw) return null;
  try { const s=JSON.parse(raw); return s.role===role?s:null; } catch(e) { return null; }
}
async function requireLogin(request, env, role) {
  const s=await getSession(request,env,role);
  if (!s) throw new Response("Unauthorized",{status:401});
  return s;
}
async function readJson(request) { try{return await request.json();}catch(e){return null;} }
function repoUrl(repo,path) { return GITHUB_API+"/repos/"+repo+"/contents/"+path; }
function decode64(value) {
  const bin=atob(String(value).replace(/\s/g,"")); const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function encode64(value) {
  const bytes=new TextEncoder().encode(value); let bin="";
  for(let i=0;i<bytes.length;i+=0x8000) bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(bin);
}
async function publishMenu(body, env) {
  const repo=String(body.repo||"Megesh123/qr-food-menu"), branch=String(body.branch||"main"), dataPath=String(body.dataPath||"menu-data.json");
  const batch=body.batch&&typeof body.batch==="object"?body.batch:{};
  const dishes=body.dishes&&typeof body.dishes==="object"?body.dishes:{};
  const state=body.state&&typeof body.state==="object"?body.state:{prices:{},availability:{}};
  const token=await env.MENU_SECRETS.get(GITHUB_TOKEN_KEY,{cacheTtl:30});
  if(!token){const e=new Error("GitHub is not configured. Master Admin must connect the GitHub token.");e.status=503;throw e;}
  for(let attempt=0;attempt<3;attempt++){
    const res=await fetch(repoUrl(repo,dataPath)+"?ref="+encodeURIComponent(branch),{cache:"no-store",headers:githubHeaders(token)});
    let file=null;
    if(res.status!==404){file=await res.json().catch(()=>null);if(!res.ok){const e=new Error(file?.message||"Could not read the published menu.");e.status=res.status;throw e;}}
    let remote=null;
    if(file?.content){try{remote=JSON.parse(decode64(file.content));}catch(e){}}
    const byId=new Map();
    (remote?.items||[]).forEach(item=>{const id=Number(item?.id);if(Number.isFinite(id))byId.set(id,Object.assign({},item,{id}));});
    Object.keys(batch).forEach(key=>{
      const id=Number(key), change=batch[key]||{}, dish=dishes[key]||dishes[id];
      if(!Number.isFinite(id)||!dish)return;
      if(change.deleted===true){byId.delete(id);return;}
      const existing=byId.get(id)||{id,name:String(dish.name||""),category:String(dish.category||"Other"),price:Number.isFinite(Number(state.prices?.[id]))?Number(state.prices[id]):Number(dish.price||0),description:String(dish.description||""),veg:dish.veg!==false,available:typeof state.availability?.[id]==="boolean"?state.availability[id]:true};
      existing.name=String(dish.name||existing.name); existing.category=String(dish.category||existing.category); existing.description=String(dish.description||existing.description||""); existing.veg=dish.veg!==false;
      if(Number.isFinite(Number(change.price))&&Number(change.price)>=0)existing.price=Math.round(Number(change.price));
      else if(!Number.isFinite(Number(existing.price)))existing.price=Number(state.prices?.[id])||Number(dish.price||0);
      if(typeof change.available==="boolean")existing.available=change.available;
      else if(typeof existing.available!=="boolean")existing.available=typeof state.availability?.[id]==="boolean"?state.availability[id]:true;
      byId.set(id,existing);
    });
    const items=Array.from(byId.values()), rt=remote?.updatedAt?Date.parse(remote.updatedAt):0, updatedAt=new Date(Math.max(Date.now(),Number.isFinite(rt)?rt+1000:0)).toISOString();
    const payload={version:1,updatedAt,items};
    const put={message:"menu: update menu data",content:encode64(JSON.stringify(payload,null,2)+"\n"),branch};
    if(file?.sha)put.sha=file.sha;
    const write=await fetch(repoUrl(repo,dataPath),{method:"PUT",headers:Object.assign(githubHeaders(token),{"Content-Type":"application/json"}),body:JSON.stringify(put)});
    const out=await write.json().catch(()=>({}));
    if(write.ok)return{updatedAt,items,commitSha:out?.commit?.sha||"",commitUrl:out?.commit?.html_url||""};
    if(write.status===409||write.status===422)continue;
    const e=new Error(out?.message||"Could not publish the menu.");e.status=write.status;throw e;
  }
  const e=new Error("GitHub changed while publishing. Please try the menu change again.");e.status=409;throw e;
}
async function saveAnalytics(body, env) {
  const repo=String(body.repo||"Megesh123/qr-food-menu"),branch=String(body.branch||"main"),path=String(body.path||"analytics-config.json"),code=String(body.code||"").trim();
  if(!/^[a-z0-9_-]+$/i.test(code)){const e=new Error("Invalid GoatCounter site code.");e.status=400;throw e;}
  const token=await env.MENU_SECRETS.get(GITHUB_TOKEN_KEY,{cacheTtl:30});
  if(!token){const e=new Error("GitHub is not configured.");e.status=503;throw e;}
  const res=await fetch(repoUrl(repo,path)+"?ref="+encodeURIComponent(branch),{cache:"no-store",headers:githubHeaders(token)});
  const file=res.ok?await res.json():null;
  if(!res.ok&&res.status!==404){const e=new Error("Could not read analytics configuration.");e.status=res.status;throw e;}
  const put={message:"analytics: configure visitor monitor",content:encode64(JSON.stringify({version:1,provider:"goatcounter",code},null,2)+"\n"),branch};
  if(file?.sha)put.sha=file.sha;
  const write=await fetch(repoUrl(repo,path),{method:"PUT",headers:Object.assign(githubHeaders(token),{"Content-Type":"application/json"}),body:JSON.stringify(put)});
  if(!write.ok){const out=await write.json().catch(()=>({}));const e=new Error(out?.message||"Could not save analytics settings.");e.status=write.status;throw e;}
  return{code};
}
export default {
  async fetch(request,env){
    const origin=request.headers.get("Origin")||"",url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:corsHeaders(origin)});
    if(origin&&origin!=="https://menu.nexgenlink.co.in")return text("Forbidden origin",403,origin);
    try{
      if(url.pathname==="/health"&&request.method==="GET"){const token=await env.MENU_SECRETS.get(GITHUB_TOKEN_KEY,{cacheTtl:30});return json({ok:true,apiVersion:API_VERSION,githubConfigured:Boolean(token)},200,origin);}
      if(url.pathname==="/auth/admin"&&request.method==="POST"){
        const b=await readJson(request),u=String(b?.username||"").trim().toLowerCase(),p=String(b?.password||"");
        if(u!=="admin"||!(await sameSecret(u+":"+p,env.ADMIN_CREDENTIAL_SHA256)))return json({ok:false,message:"Incorrect username or passcode."},401,origin);
        const token=crypto.randomUUID()+"-"+crypto.randomUUID();await env.MENU_SECRETS.put(SESSION_PREFIX+token,JSON.stringify({role:"admin",createdAt:Date.now()}),{expirationTtl:86400});return json({ok:true,sessionToken:token},200,origin);
      }
      if(url.pathname==="/auth/master"&&request.method==="POST"){
        const b=await readJson(request),u=String(b?.username||"").trim().toLowerCase(),p=String(b?.password||"");
        if(u!=="masteradmin"||!(await sameSecret(u+":"+p,env.MASTER_CREDENTIAL_SHA256)))return json({ok:false,message:"Incorrect master username or passcode."},401,origin);
        const token=crypto.randomUUID()+"-"+crypto.randomUUID();await env.MENU_SECRETS.put(SESSION_PREFIX+token,JSON.stringify({role:"master",createdAt:Date.now()}),{expirationTtl:86400});return json({ok:true,sessionToken:token},200,origin);
      }
      if(url.pathname==="/status"&&request.method==="GET"){const token=await env.MENU_SECRETS.get(GITHUB_TOKEN_KEY,{cacheTtl:30});return json({ok:true,githubConfigured:Boolean(token)},200,origin);}
      if(url.pathname==="/configure/github"&&request.method==="POST"){
        await requireLogin(request,env,"master");const b=await readJson(request),token=String(b?.token||"").trim(),repo=String(b?.repo||"Megesh123/qr-food-menu");
        if(!token)return json({ok:false,message:"GitHub token is required."},400,origin);
        const login=await verifyGithubToken(token,repo);await env.MENU_SECRETS.put(GITHUB_TOKEN_KEY,token);return json({ok:true,githubUser:login},200,origin);
      }
      if(url.pathname==="/publish"&&request.method==="POST"){await requireLogin(request,env,"admin");return json({ok:true,result:await publishMenu(await readJson(request)||{},env)},200,origin);}
      if(url.pathname==="/analytics"&&request.method==="POST"){await requireLogin(request,env,"master");return json({ok:true,result:await saveAnalytics(await readJson(request)||{},env)},200,origin);}
      return text("Not found",404,origin);
    }catch(error){
      if(error instanceof Response)return error;
      console.error(error);return json({ok:false,message:error?.message||"Server error."},error?.status||500,origin);
    }
  }
};
