const THEME_KEY="spice-street-theme-v1";
function applyTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const theme=saved==="light"?"light":"dark";
  document.body.classList.toggle("light",theme==="light");
  const btn=document.getElementById("themeToggle");
  if(btn){btn.textContent=theme==="dark"?"☀️ Light":"🌙 Dark";btn.setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");}
}
function toggleTheme(){const next=document.body.classList.contains("light")?"dark":"light";localStorage.setItem(THEME_KEY,next);applyTheme();}
const themeToggle=document.getElementById("themeToggle");
if(themeToggle)themeToggle.addEventListener("click",toggleTheme);
applyTheme();
window.addEventListener("pageshow", applyTheme);
window.addEventListener("storage", (event)=>{ if(event.key===THEME_KEY) applyTheme(); });

const ADMIN_SESSION="spice-street-admin-session";
const adminLogin=document.getElementById("adminLogin");
const adminApp=document.getElementById("adminApp");
if(document.getElementById("loginForm")){
  if(sessionStorage.getItem(ADMIN_SESSION)==="true"){adminLogin.hidden=true;adminApp.hidden=false;}
  document.getElementById("loginForm").addEventListener("submit",e=>{
    e.preventDefault();
    const u=document.getElementById("loginUsername").value.trim();
    const p=document.getElementById("loginPassword").value;
    const error=document.getElementById("loginError");
    if(u==="admin"&&p==="admin"){
      sessionStorage.setItem(ADMIN_SESSION,"true");
      adminLogin.hidden=true;adminApp.hidden=false;error.textContent="";renderAdmin();
    }else error.textContent="Incorrect username or password.";
  });
}

const CATEGORIES={
  "Biriyani & Rice":"🍚","Starters":"🍗","South Indian":"🥘","Breads":"🫓",
  "Curries":"🍛","Pizza":"🍕","Burgers & Sandwiches":"🍔","Chinese":"🥡",
  "Pasta":"🍝","Desserts":"🍰","Ice Cream":"🍨","Drinks":"🥤"
};
const DISHES=[
{id:1,name:"Chicken Biriyani",category:"Biriyani & Rice",price:120,description:"Basmati rice, chicken and aromatic spices."},
{id:2,name:"Mutton Biriyani",category:"Biriyani & Rice",price:180,description:"Slow-cooked mutton with fragrant biriyani rice."},
{id:3,name:"Egg Biriyani",category:"Biriyani & Rice",price:110,description:"Fragrant biriyani rice with seasoned boiled egg."},
{id:4,name:"Veg Biriyani",category:"Biriyani & Rice",price:100,description:"Basmati rice cooked with fresh vegetables and spices."},
{id:5,name:"Mushroom Biriyani",category:"Biriyani & Rice",price:120,description:"Aromatic rice with tender mushrooms and herbs."},
{id:6,name:"Jeera Rice",category:"Biriyani & Rice",price:80,description:"Steamed basmati rice tempered with cumin."},
{id:7,name:"Chicken 65",category:"Starters",price:110,description:"Crispy, spicy South Indian chicken starter."},
{id:8,name:"Paneer 65",category:"Starters",price:100,description:"Crispy paneer tossed with Indian spices."},
{id:9,name:"Chicken Lollipop",category:"Starters",price:150,description:"Crispy chicken wings coated in spicy masala."},
{id:10,name:"Gobi 65",category:"Starters",price:90,description:"Crispy cauliflower with chilli and curry leaves."},
{id:11,name:"Mushroom Pepper Fry",category:"Starters",price:100,description:"Mushroom tossed with cracked pepper and onions."},
{id:12,name:"Idli",category:"South Indian",price:40,description:"Soft steamed rice cakes served with chutney and sambar."},
{id:13,name:"Vada",category:"South Indian",price:45,description:"Crispy lentil fritter served with chutney."},
{id:14,name:"Plain Dosa",category:"South Indian",price:55,description:"Golden crispy dosa with chutney and sambar."},
{id:15,name:"Masala Dosa",category:"South Indian",price:80,description:"Crispy dosa filled with seasoned potato masala."},
{id:16,name:"Ghee Roast Dosa",category:"South Indian",price:95,description:"Thin dosa roasted with aromatic ghee."},
{id:17,name:"Pongal",category:"South Indian",price:60,description:"Comforting rice and lentil pongal with ghee."},
{id:18,name:"Veg Meals",category:"South Indian",price:100,description:"Rice, vegetables, sambar, rasam and sides."},
{id:19,name:"Parotta",category:"Breads",price:25,description:"Flaky layered South Indian flatbread."},
{id:20,name:"Egg Parotta",category:"Breads",price:70,description:"Layered parotta tossed with egg and spices."},
{id:21,name:"Chapati",category:"Breads",price:35,description:"Soft whole-wheat flatbread."},
{id:22,name:"Butter Naan",category:"Breads",price:55,description:"Soft naan brushed with butter."},
{id:23,name:"Garlic Naan",category:"Breads",price:65,description:"Tandoor-baked naan with garlic and coriander."},
{id:24,name:"Chicken Curry",category:"Curries",price:130,description:"Homestyle chicken curry with rich spices."},
{id:25,name:"Mutton Curry",category:"Curries",price:180,description:"Tender mutton cooked in a traditional masala."},
{id:26,name:"Fish Curry",category:"Curries",price:150,description:"South Indian fish curry with tangy spices."},
{id:27,name:"Paneer Butter Masala",category:"Curries",price:130,description:"Paneer in a creamy tomato and butter gravy."},
{id:28,name:"Dal Tadka",category:"Curries",price:90,description:"Yellow lentils finished with a fragrant tempering."},
{id:29,name:"Margherita Pizza",category:"Pizza",price:180,description:"Tomato, mozzarella and basil on a crisp base."},
{id:30,name:"Veggie Pizza",category:"Pizza",price:220,description:"Onion, capsicum, corn and tomato with cheese."},
{id:31,name:"Paneer Tikka Pizza",category:"Pizza",price:250,description:"Paneer tikka, onion and capsicum with cheese."},
{id:32,name:"Chicken Tikka Pizza",category:"Pizza",price:280,description:"Chicken tikka, onion and capsicum on a cheesy base."},
{id:33,name:"Cheese Burst Pizza",category:"Pizza",price:260,description:"Loaded cheese pizza with a rich cheese-filled crust."},
{id:34,name:"Classic Veg Burger",category:"Burgers & Sandwiches",price:100,description:"Crispy veg patty with lettuce, tomato and sauce."},
{id:35,name:"Chicken Burger",category:"Burgers & Sandwiches",price:140,description:"Juicy chicken patty with fresh salad and sauce."},
{id:36,name:"Paneer Burger",category:"Burgers & Sandwiches",price:130,description:"Spiced paneer patty with creamy sauce."},
{id:37,name:"Grilled Cheese Sandwich",category:"Burgers & Sandwiches",price:90,description:"Toasted bread with melted cheese and herbs."},
{id:38,name:"Chicken Club Sandwich",category:"Burgers & Sandwiches",price:150,description:"Triple-layer sandwich with chicken, egg and salad."},
{id:39,name:"Veg Hakka Noodles",category:"Chinese",price:120,description:"Wok-tossed noodles with vegetables and sauces."},
{id:40,name:"Chicken Hakka Noodles",category:"Chinese",price:150,description:"Wok-tossed noodles with chicken and vegetables."},
{id:41,name:"Veg Fried Rice",category:"Chinese",price:110,description:"Fragrant fried rice with fresh vegetables."},
{id:42,name:"Chicken Fried Rice",category:"Chinese",price:140,description:"Wok-fried rice with chicken, egg and vegetables."},
{id:43,name:"Gobi Manchurian",category:"Chinese",price:110,description:"Crispy cauliflower in a tangy Manchurian sauce."},
{id:44,name:"White Sauce Pasta",category:"Pasta",price:150,description:"Creamy pasta with herbs and vegetables."},
{id:45,name:"Arrabbiata Pasta",category:"Pasta",price:140,description:"Pasta in a spicy tomato and garlic sauce."},
{id:46,name:"Chicken Alfredo Pasta",category:"Pasta",price:190,description:"Creamy Alfredo pasta with tender chicken."},
{id:47,name:"Pesto Veg Pasta",category:"Pasta",price:170,description:"Pasta tossed with basil pesto and vegetables."},
{id:48,name:"Gulab Jamun",category:"Desserts",price:50,description:"Soft milk-solid dumplings in sugar syrup."},
{id:49,name:"Brownie",category:"Desserts",price:80,description:"Warm chocolate brownie with a rich fudgy center."},
{id:50,name:"Chocolate Cake",category:"Desserts",price:90,description:"Moist chocolate cake with creamy frosting."},
{id:51,name:"Carrot Halwa",category:"Desserts",price:70,description:"Slow-cooked carrot dessert with milk and nuts."},
{id:52,name:"Payasam",category:"Desserts",price:60,description:"Traditional South Indian milk and vermicelli dessert."},
{id:53,name:"Vanilla Ice Cream",category:"Ice Cream",price:60,description:"Classic creamy vanilla scoop."},
{id:54,name:"Chocolate Ice Cream",category:"Ice Cream",price:70,description:"Rich chocolate ice cream scoop."},
{id:55,name:"Mango Ice Cream",category:"Ice Cream",price:70,description:"Creamy seasonal mango ice cream."},
{id:56,name:"Ice Cream Sundae",category:"Ice Cream",price:110,description:"Scoops topped with chocolate sauce and nuts."},
{id:57,name:"Lime Juice",category:"Drinks",price:30,description:"Fresh lime juice served chilled."},
{id:58,name:"Fresh Fruit Juice",category:"Drinks",price:60,description:"Seasonal fresh fruit juice."},
{id:59,name:"Mango Juice",category:"Drinks",price:70,description:"Refreshing mango juice."},
{id:60,name:"Fresh Lime Soda",category:"Drinks",price:40,description:"Chilled lime soda with a refreshing fizz."},
{id:61,name:"Cold Coffee",category:"Drinks",price:90,description:"Chilled creamy coffee drink."},
{id:62,name:"Masala Tea",category:"Drinks",price:30,description:"Hot Indian tea brewed with aromatic spices."}
];
const GITHUB_REPO="Megesh123/qr-food-menu";
const GITHUB_BRANCH="main";
const GITHUB_DATA_PATH="menu-data.json";
const GITHUB_TOKEN_KEY="spice-street-github-token-v1";
async function getPublishedMenu(){
  try{const r=await fetch("/menu-data.json?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("Menu data unavailable");return await r.json()}catch(e){return null}
}
async function publishMenuToGitHub(){
  const token=sessionStorage.getItem(GITHUB_TOKEN_KEY)||prompt("Enter a GitHub fine-grained token with Contents: Read and write permission for this repository. It is kept only in this browser session.");
  if(!token)return;
  sessionStorage.setItem(GITHUB_TOKEN_KEY,token);
  const state=getAvailability(),prices=getPrices();
  const payload={version:1,updatedAt:new Date().toISOString(),items:DISHES.map(d=>({...d,price:Number(prices[d.id]??d.price),available:Boolean(state[d.id])}))};
  const headers={Authorization:"Bearer "+token,Accept:"application/vnd.github+json","Content-Type":"application/json"};
  try{
    const existing=await fetch("https://api.github.com/repos/"+GITHUB_REPO+"/contents/"+GITHUB_DATA_PATH+"?ref="+GITHUB_BRANCH,{headers});
    let sha="";
    if(existing.ok){const data=await existing.json();sha=data.sha}
    const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(payload,null,2)+"\n")));
    const body={message:"Update live menu data",content:encoded,branch:GITHUB_BRANCH,...(sha?{sha}:{})};
    const r=await fetch("https://api.github.com/repos/"+GITHUB_REPO+"/contents/"+GITHUB_DATA_PATH,{method:"PUT",headers,body:JSON.stringify(body)});
    if(!r.ok){const err=await r.json().catch(()=>({}));throw new Error(err.message||"GitHub update failed")}
    alert("Menu updated in GitHub successfully. The customer menu will use the published data after GitHub Pages refreshes.");
  }catch(e){alert("Could not update GitHub: "+e.message)}
}

const STORAGE_KEY="spice-street-availability-v2";const PRICE_KEY="spice-street-prices-v1";function getPrices(){const s=localStorage.getItem(PRICE_KEY);if(s)return JSON.parse(s);const p={};DISHES.forEach(d=>p[d.id]=d.price);return p}function savePrices(p){localStorage.setItem(PRICE_KEY,JSON.stringify(p));}
function getAvailability(){const saved=localStorage.getItem(STORAGE_KEY);if(saved)return JSON.parse(saved);const initial={};DISHES.forEach(d=>initial[d.id]=true);initial[2]=false;initial[58]=false;return initial}
function saveAvailability(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function renderCustomer(){const menu=document.getElementById("menu");if(!menu)return;const state=getAvailability();const prices=getPrices();const groups={};DISHES.forEach(d=>{if(!groups[d.category])groups[d.category]=[];groups[d.category].push(d)});let html="";Object.entries(groups).forEach(([category,dishes])=>{html+='<section class="category-section"><div class="category-heading"><div class="category-icon">'+(CATEGORIES[category]||"🍽️")+'</div><div><h2>'+category+'</h2><p>'+dishes.length+' items</p></div></div><div class="menu-grid">';dishes.forEach(d=>{const a=state[d.id];html+='<article class="menu-card '+(a?"":"sold")+'"><div><div class="category">'+category+'</div><div class="dish-name">'+d.name+'</div><div class="description">'+d.description+'</div><div class="price">₹'+(prices[d.id]??d.price)+'</div></div><div class="badge '+(a?"on":"off")+'">'+(a?"✓ Available":"✕ Sold out")+'</div></article>'});html+="</div></section>"});menu.innerHTML=html}
function renderAdmin(){const list=document.getElementById("adminMenu");if(!list||!adminApp||adminApp.hidden)return;const state=getAvailability();const prices=getPrices();const available=DISHES.filter(d=>state[d.id]).length;document.getElementById("availableCount").textContent=available;document.getElementById("soldOutCount").textContent=DISHES.length-available;let html="",lastCategory="";DISHES.forEach(d=>{const on=state[d.id];if(lastCategory!==d.category){html+='<div class="admin-category">'+(CATEGORIES[d.category]||"🍽️")+" "+d.category+"</div>";lastCategory=d.category}html+='<div class="admin-row"><div class="admin-info"><div class="admin-food-icon">'+(CATEGORIES[d.category]||"🍽️")+'</div><div><strong>'+d.name+'</strong><div class="price-editor"><span>₹</span><input class="price-input" type="number" min="0" step="1" value="'+(prices[d.id]??d.price)+'" data-price-id="'+d.id+'"><button class="price-save" data-save-price="'+d.id+'">Save</button></div></div></div><button class="toggle '+(on?"on":"off")+'" data-id="'+d.id+'">'+(on?"AVAILABLE":"SOLD OUT")+"</button></div>"});list.innerHTML=html;list.querySelectorAll(".toggle").forEach(b=>b.addEventListener("click",()=>{const s=getAvailability();const id=Number(b.dataset.id);s[id]=!s[id];saveAvailability(s);renderAdmin()}));list.querySelectorAll(".price-save").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.savePrice);const input=list.querySelector('[data-price-id="'+id+'"]');const value=Math.max(0,Math.round(Number(input.value)));if(!Number.isFinite(value))return;const p=getPrices();p[id]=value;savePrices(p);renderAdmin()}))}
const publishBtn=document.getElementById("publishBtn");
if(publishBtn)publishBtn.addEventListener("click",publishMenuToGitHub);
const resetBtn=document.getElementById("resetBtn");
if(resetBtn)resetBtn.addEventListener("click",()=>{if(confirm("Reset all dishes to available?")){const s={};DISHES.forEach(d=>s[d.id]=true);saveAvailability(s);renderAdmin()}});
window.addEventListener("storage",()=>{renderCustomer();renderAdmin()});
renderCustomer();renderAdmin();
async function syncPublishedMenu(){
  const data=await getPublishedMenu();
  if(!data||!Array.isArray(data.items))return;
  const availability={},prices={};
  data.items.forEach(item=>{availability[item.id]=Boolean(item.available);prices[item.id]=Number(item.price);});
  localStorage.setItem(STORAGE_KEY,JSON.stringify(availability));
  localStorage.setItem(PRICE_KEY,JSON.stringify(prices));
  renderCustomer();
  renderAdmin();
}
syncPublishedMenu();
