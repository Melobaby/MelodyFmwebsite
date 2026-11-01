const cap=s=>s[0].toUpperCase()+s.slice(1);
const get=u=>fetch(u).then(r=>r.json()).catch(()=>null);
const lagos=()=>{const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",weekday:"long",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t).value;return{day:g("weekday").toLowerCase(),mins:+g("hour")*60+ +g("minute")}};
const mins=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const fmt=t=>{const[h,m]=t.split(":").map(Number);return`${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rows(list,live){return list.length?`<ul class="rows">${list.map(s=>{const n=live!=null&&mins(s.start)<=live&&live<mins(s.end);return`<li${n?' class="now"':""}><span class="time">${fmt(s.start)} – ${fmt(s.end)}</span><span>${esc(s.title)}${n?' <span class="badge">On air</span>':""}</span><span class="host">${esc(s.host)}</span></li>`}).join("")}</ul>`:'<p class="empty">No programmes listed for this day yet.</p>'}
async function init(){
  const btn=document.getElementById("play");
  if(btn){const a=new Audio();btn.onclick=()=>{if(a.paused){a.src=btn.dataset.stream;a.play();btn.classList.add("playing");btn.lastChild.textContent="Pause"}else{a.pause();a.removeAttribute("src");a.load();btn.classList.remove("playing");btn.lastChild.textContent="Listen live"}}}
  const sched=await get("data/schedule.json");const items=(sched&&sched.shows)||[];
  const byDay=d=>items.filter(s=>(s.days||[]).includes(d)).sort((a,b)=>mins(a.start)-mins(b.start));
  const now=lagos();
  const today=document.getElementById("today");
  if(today)today.innerHTML=rows(byDay(now.day),now.mins);
  const week=document.getElementById("week");
  if(week){const tabs=document.getElementById("tabs"),show=d=>{tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",b.dataset.d===d));week.innerHTML=rows(byDay(d),d===now.day?now.mins:null)};
    tabs.innerHTML=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map(d=>`<button role="tab" data-d="${d}">${cap(d)}</button>`).join("");
    tabs.onclick=e=>{if(e.target.dataset.d)show(e.target.dataset.d)};show(now.day)}
  const st=document.getElementById("stories-list");
  if(st){const d=await get("data/stories.json");const l=((d&&d.stories)||[]).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    st.innerHTML=l.length?l.map(s=>`<article class="story"><time>${new Date(s.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</time><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p></article>`).join(""):'<p class="empty">Stories will appear here.</p>'}
}
init();
