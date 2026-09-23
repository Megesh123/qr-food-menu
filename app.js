const DISHES=[
{id:1,name:"Chicken Biriyani",category:"Main Course",price:120,description:"Basmati rice, chicken and aromatic spices."},
{id:2,name:"Mutton Biriyani",category:"Main Course",price:180,description:"Slow-cooked mutton with fragrant biriyani rice."},
{id:3,name:"Veg Meals",category:"Main Course",price:100,description:"Rice, vegetables, sambar, rasam and sides."},
{id:4,name:"Chicken 65",category:"Starters",price:110,description:"Crispy, spicy South Indian chicken starter."},
{id:5,name:"Paneer 65",category:"Starters",price:100,description:"Crispy paneer tossed with Indian spices."},
{id:6,name:"Parotta",category:"Breads",price:25,description:"Flaky layered South Indian flatbread."},
{id:7,name:"Chicken Curry",category:"Side Dish",price:130,description:"Homestyle chicken curry with rich spices."},
{id:8,name:"Lime Juice",category:"Drinks",price:30,description:"Fresh lime juice served chilled."},
{id:9,name:"Fresh Fruit Juice",category:"Drinks",price:60,description:"Seasonal fresh fruit juice."},
{id:10,name:"Gulab Jamun",category:"Dessert",price:50,description:"Soft milk-solid dumplings in sugar syrup."}
];
const STORAGE_KEY="spice-street-availability-v1";
function getAvailability(){const saved=localStorage.getItem(STORAGE_KEY);if(saved)return JSON.parse(saved);const initial={};DISHES.forEach(d=>initial[d.id]=true);initial[2]=false;initial[9]=false;return initial}
function saveAvailability(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function renderCustomer(){const menu=document.getElementById("menu");if(!menu)return;const state=getAvailability();menu.innerHTML=DISHES.map(d=>{const a=state[d.id];return `<article class="menu-card ${a?"":"sold"}"><div><div class="category">${d.category}</div><div class="dish-name">${d.name}</div><div class="description">${d.description}</div><div class="price">₹${d.price}</div></div><div class="badge ${a?"on":"off"}">${a?"✓ Available":"✕ Sold out"}</div></article>`}).join("")}
function renderAdmin(){const list=document.getElementById("adminMenu");if(!list)return;const state=getAvailability();const available=DISHES.filter(d=>state[d.id]).length;document.getElementById("availableCount").textContent=available;document.getElementById("soldOutCount").textContent=DISHES.length-available;list.innerHTML=DISHES.map(d=>{const on=state[d.id];return `<div class="admin-row"><div class="admin-info"><strong>${d.name}</strong><span>${d.category} • ₹${d.price}</span></div><button class="toggle ${on?"on":"off"}" data-id="${d.id}">${on?"AVAILABLE":"SOLD OUT"}</button></div>`}).join("");list.querySelectorAll(".toggle").forEach(b=>b.addEventListener("click",()=>{const s=getAvailability();const id=Number(b.dataset.id);s[id]=!s[id];saveAvailability(s);renderAdmin()}))}
const resetBtn=document.getElementById("resetBtn");if(resetBtn)resetBtn.addEventListener("click",()=>{if(confirm("Reset all dishes to available?")){const s={};DISHES.forEach(d=>s[d.id]=true);saveAvailability(s);renderAdmin()}});renderCustomer();renderAdmin();